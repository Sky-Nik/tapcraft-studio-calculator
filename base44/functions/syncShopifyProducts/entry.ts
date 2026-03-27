import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const storeUrl = Deno.env.get('SHOPIFY_STORE_URL');
    const accessToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
    
    if (!storeUrl || !accessToken) {
      return Response.json({ 
        error: 'Shopify credentials not configured' 
      }, { status: 400 });
    }
    
    // Fetch products from Shopify
    const response = await fetch(
      `https://${storeUrl}/admin/api/2024-01/products.json?limit=250`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      return Response.json({ 
        error: 'Failed to fetch from Shopify', 
        details: error 
      }, { status: response.status });
    }
    
    const data = await response.json();
    const shopifyProducts = data.products || [];
    
    let created = 0;
    let updated = 0;
    
    // Sync each product
    for (const product of shopifyProducts) {
      const existing = await base44.asServiceRole.entities.Product.filter({ 
        sku: `SHOPIFY-${product.id}` 
      });
      
      const productData = {
        name: product.title,
        sku: `SHOPIFY-${product.id}`,
        category: product.product_type || 'General',
        cost: parseFloat(product.variants?.[0]?.price || 0),
        price: parseFloat(product.variants?.[0]?.price || 0),
        stock_quantity: product.variants?.[0]?.inventory_quantity || 0,
        notes: `Synced from Shopify: ${product.handle}`
      };
      
      if (existing.length > 0) {
        await base44.asServiceRole.entities.Product.update(existing[0].id, productData);
        updated++;
      } else {
        await base44.asServiceRole.entities.Product.create(productData);
        created++;
      }
    }
    
    return Response.json({ 
      success: true, 
      synced: shopifyProducts.length,
      created,
      updated
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});