/**
 * Declaration for html2pdf.js (no upstream types).
 * We type only the API we use.
 */
declare module "html2pdf.js" {
  interface Html2PdfOptions {
    filename?: string
    margin?: number[]
    image?: { type: string; quality: number }
    html2canvas?: { scale: number }
    jsPDF?: { unit: string; format: string; orientation: string }
  }
  interface Html2PdfInstance {
    set(opts: Html2PdfOptions): Html2PdfInstance
    from(el: HTMLElement): Html2PdfInstance
    save(): Promise<void>
  }
  const html2pdf: () => Html2PdfInstance
  export default html2pdf
}
