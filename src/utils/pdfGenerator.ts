import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Proposal } from '@/types/representative';

interface PDFGenerationOptions {
  proposal: Proposal;
  client: any;
  products: any[];
  totals: {
    total_value: number;
    total_commission: number;
  };
}

export class PDFGenerator {
  static async generateProposalPDF(options: PDFGenerationOptions): Promise<Blob> {
    const { proposal, client, products, totals } = options;

    // Create a temporary div with the PDF content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.padding = '40px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';

    tempDiv.innerHTML = `
      <div style="margin-bottom: 40px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h1 style="color: #22c55e; font-size: 28px; margin: 0;">AgroIkemba</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Proposta Comercial</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">#${proposal.proposal_number}</div>
            <div style="color: #666; font-size: 14px;">Data: ${new Date().toLocaleDateString('pt-BR')}</div>
          </div>
        </div>
        <hr style="border: none; border-top: 2px solid #22c55e;">
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="color: #333; margin-bottom: 15px;">Dados do Cliente</h3>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong>Empresa:</strong><br>
              ${client?.company_name || 'N/A'}
            </div>
            <div>
              <strong>Contato:</strong><br>
              ${client?.contact_name || 'N/A'}
            </div>
            <div>
              <strong>Localização:</strong><br>
              ${client?.city || 'N/A'}, ${client?.state || 'N/A'}
            </div>
            <div>
              <strong>Telefone:</strong><br>
              ${client?.phone || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="color: #333; margin-bottom: 15px;">Produtos e Serviços</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #22c55e; color: white;">
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Produto</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Qtd</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Preço Unit.</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${products.map((product, index) => `
              <tr style="${index % 2 === 0 ? 'background: #f8f9fa;' : ''}">
                <td style="padding: 12px; border: 1px solid #ddd;">
                  <div style="font-weight: bold;">${product.name}</div>
                  <div style="font-size: 12px; color: #666;">SKU: ${product.sku}</div>
                  ${product.selected_locations ? product.selected_locations.map((loc: any) => 
                    `<div style="font-size: 11px; color: #22c55e;">📍 ${loc.city}, ${loc.state}: ${loc.quantity.toLocaleString()}L</div>`
                  ).join('') : ''}
                </td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${product.quantity.toLocaleString()}</td>
                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">R$ ${product.unit_price.toFixed(2)}</td>
                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">R$ ${(product.quantity * product.unit_price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 20px;">
          <div style="font-size: 18px; font-weight: bold; color: #333;">
            Total: R$ ${totals.total_value.toFixed(2)}
          </div>
          <div style="font-size: 14px; color: #22c55e; margin-top: 5px;">
            Comissão: R$ ${totals.total_commission.toFixed(2)}
          </div>
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="color: #333; margin-bottom: 15px;">Condições Comerciais</h3>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <div style="margin-bottom: 10px;">
            <strong>Forma de Pagamento:</strong> ${proposal.payment_terms || 'A definir'}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Condições de Entrega:</strong> ${proposal.delivery_terms || 'A definir'}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Validade da Proposta:</strong> ${new Date(proposal.validity_date).toLocaleDateString('pt-BR')}
          </div>
          ${proposal.observations ? `
            <div style="margin-top: 15px;">
              <strong>Observações:</strong><br>
              ${proposal.observations}
            </div>
          ` : ''}
        </div>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
        <p>© 2024 AgroIkemba. Todos os direitos reservados.</p>
        <p>Em caso de dúvidas, entre em contato conosco.</p>
      </div>
    `;

    document.body.appendChild(tempDiv);

    try {
      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Return as blob
      return pdf.output('blob');
    } finally {
      document.body.removeChild(tempDiv);
    }
  }

  static async downloadProposalPDF(options: PDFGenerationOptions, filename?: string): Promise<void> {
    const blob = await this.generateProposalPDF(options);
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `proposta-${options.proposal.proposal_number}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  }
}