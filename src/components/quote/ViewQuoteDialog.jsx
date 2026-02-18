import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export default function ViewQuoteDialog({ quote, companySettings, open, onClose }) {
  const contentRef = useRef(null);

  const handleExportPDF = async () => {
    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Handle multi-page PDF if content is too long
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`quote-${quote.part_name}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success("PDF exported successfully");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  if (!quote) return null;

  const company = companySettings || {};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>View Quotation</DialogTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleExportPDF}
                className="bg-gradient-to-r from-[#1E73FF] to-[#0056D6] hover:from-[#4A9AFF] hover:to-[#1E73FF]"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div ref={contentRef} className="bg-white p-8 text-gray-900">
          {/* Header with Company Info */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
            <div>
              {company.logo_url && (
                <img src={company.logo_url} alt="Company Logo" className="h-24 mb-3" crossOrigin="anonymous" />
              )}
              <h1 className="text-2xl font-bold text-gray-900">{company.company_name || "TapCraft Studio"}</h1>
              {company.address && <p className="text-sm text-gray-600 mt-1">{company.address}</p>}
              {company.abn && <p className="text-sm text-gray-600">ABN: {company.abn}</p>}
            </div>
            <div className="text-right text-sm">
              {company.phone && <p className="text-gray-600">Phone: {company.phone}</p>}
              {company.email && <p className="text-gray-600">Email: {company.email}</p>}
              {company.website && <p className="text-gray-600">Web: {company.website}</p>}
            </div>
          </div>

          {/* Quote Title */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">QUOTATION</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Quote Date:</p>
                <p className="font-semibold">{new Date(quote.created_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Status:</p>
                <p className="font-semibold capitalize">{quote.status}</p>
              </div>
            </div>
          </div>

          {/* Part Details */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">
              {quote.combined ? "Combined Parts" : "Part Details"}
            </h3>
            {quote.combined ? (
              <div className="space-y-2">
                {quote.parts?.map((part, idx) => (
                  <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                    <span className="font-semibold">{part.name}</span>
                    <span className="text-gray-600">{part.material} • {part.weight}g • Qty: {part.quantity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Part Name:</p>
                  <p className="font-semibold">{quote.part_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Material:</p>
                  <p className="font-semibold">{quote.filament_type}</p>
                </div>
                <div>
                  <p className="text-gray-600">Material Weight:</p>
                  <p className="font-semibold">{quote.material_weight_g}g</p>
                </div>
                <div>
                  <p className="text-gray-600">Print Time:</p>
                  <p className="font-semibold">{Math.floor(quote.print_time_minutes / 60)}h {quote.print_time_minutes % 60}m</p>
                </div>
                {quote.batch_quantity > 1 && (
                  <div>
                    <p className="text-gray-600">Batch Quantity:</p>
                    <p className="font-semibold">{quote.batch_quantity} units</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pricing — clean customer-facing, no internal breakdown */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">Pricing</h3>
            <table className="w-full text-sm">
              <tbody>
                {(quote.vat_percent > 0) && (
                  <>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-600">Price (excl. GST)</td>
                      <td className="py-2 text-right font-semibold">AUD {(quote.final_price_with_vat / (1 + (quote.vat_percent / 100))).toFixed(2)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-600">GST ({quote.vat_percent}%)</td>
                      <td className="py-2 text-right font-semibold">AUD {(quote.final_price_with_vat - quote.final_price_with_vat / (1 + (quote.vat_percent / 100))).toFixed(2)}</td>
                    </tr>
                  </>
                )}
                <tr className="border-t-2 border-gray-900 font-bold text-base">
                  <td className="py-3">
                    {quote.vat_percent > 0 ? "Total (incl. GST)" : "Total Price"}
                    {quote.batch_quantity > 1 && <span className="text-sm font-normal text-gray-500 ml-2">× {quote.batch_quantity} units</span>}
                  </td>
                  <td className="py-3 text-right text-lg">
                    AUD {(quote.vat_percent > 0 ? quote.final_price_with_vat : quote.final_price).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>



          {/* Footer with Payment Info and Social */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            {company.payment_info && (
              <div className="mb-4">
                <h4 className="font-bold text-gray-900 mb-2">Payment Information</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{company.payment_info}</p>
              </div>
            )}
            {(company.facebook || company.instagram || company.linkedin) && (
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Connect With Us</h4>
                <div className="flex gap-4 text-sm text-gray-600">
                  {company.facebook && <p>Facebook: {company.facebook}</p>}
                  {company.instagram && <p>Instagram: {company.instagram}</p>}
                  {company.linkedin && <p>LinkedIn: {company.linkedin}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Terms */}
          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>This quotation is valid for 30 days from the date of issue.</p>
            <p>Thank you for your business!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}