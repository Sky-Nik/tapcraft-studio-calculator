import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createHmac } from "node:crypto";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify Shopify webhook signature
    const hmacHeader = req.headers.get('X-Shopify-Hmac-Sha256');
    const shopifyTopic = req.headers.get('X-Shopify-Topic');
    const body = await req.text();
    
    const secret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET');
    if (secret && hmacHeader) {
      const hash = createHmac('sha256', secret)
        .update(body)
        .digest('base64');
      
      if (hash !== hmacHeader) {
        return Response.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
    
    const product = JSON.parse(body);
    
    // Handle product creation/update
    if (shopifyTopic === 'products/create' || shopifyTopic === 'products/update') {
      // Check if product already exists
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
        // Update existing product
        await base44.asServiceRole.entities.Product.update(existing[0].id, productData);
      } else {
        // Create new product
        await base44.asServiceRole.entities.Product.create(productData);
      }
      
      return Response.json({ success: true, action: existing.length > 0 ? 'updated' : 'created' });
    }
    
    // Handle product deletion
    if (shopifyTopic === 'products/delete') {
      const existing = await base44.asServiceRole.entities.Product.filter({ 
        sku: `SHOPIFY-${product.id}` 
      });
      
      if (existing.length > 0) {
        await base44.asServiceRole.entities.Product.delete(existing[0].id);
      }
      
      return Response.json({ success: true, action: 'deleted' });
    }
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});