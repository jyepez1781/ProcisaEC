
import { Usuario, Equipo } from '../types';
import Swal from 'sweetalert2';

/**
 * Genera el string HTML del documento de asignación (Carta Responsiva + Anexo 1)
 * Sin imprimir, solo retorna el texto.
 */
export const getAssignmentDocumentHTML = (usuario: Usuario, equipo: Equipo): string => {
  const today = new Date();
  const fechaAsignacion = `${today.getDate()} de ${today.toLocaleString('es-ES', { month: 'long' })} del ${today.getFullYear()}`;
  const fechaCorta = today.toLocaleDateString('es-ES');

  const serieCargador = equipo.serie_cargador || 'N/A';
  const observacionesEquipo = equipo.observaciones || 'Sin observaciones';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Documentos de Asignación</title>
        <style>
          @page { size: A4 portrait; margin: 1.5cm; }
          body { font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.3; color: #000; margin: 0; }
          
          .page-break { page-break-after: always; }
          .text-center { text-align: center; }
          .text-justify { text-align: justify; }
          .text-bold { font-weight: bold; }
          .mb-2 { margin-bottom: 10px; }
          .mb-4 { margin-bottom: 20px; }
          
          /* --- ANEXO 1 STYLES --- */
          .anexo-container { padding: 10px; }
          .anexo-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
          .logo-img { max-height: 60px; width: auto; } 
          .anexo-label { font-weight: bold; font-size: 10pt; margin-top: 10px; text-align: right;}
          .anexo-title { text-align: center; font-weight: bold; text-decoration: underline; margin: 20px 0; font-size: 11pt; text-transform: uppercase; }
          .anexo-footer { margin-top: 60px; }
          .signature-line { border-top: 1px solid #000; width: 250px; padding-top: 5px; font-weight: bold; margin-bottom: 5px;}

          /* --- CARTA RESPONSIVA STYLES --- */
          .responsiva-container { padding: 10px; }
          
          table.header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          table.header-table td { border: 1px solid #000; padding: 5px; text-align: center; vertical-align: middle; }
          .header-logo-cell { width: 20%; }
          .header-title-cell { width: 50%; font-weight: bold; font-size: 11pt; }
          .header-info-cell { width: 30%; font-size: 9pt; text-align: left; }

          table.eq-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9pt; }
          table.eq-table th { border: 1px solid #000; background-color: #f0f0f0; padding: 5px; font-weight: bold; text-align: center; }
          table.eq-table td { border: 1px solid #000; padding: 5px; text-align: center; vertical-align: top; }

          .responsiva-section-title { font-weight: bold; margin-top: 10px; margin-bottom: 5px; }
          ul.responsiva-list { padding-left: 20px; margin: 5px 0 15px 0; }
          ul.responsiva-list li { margin-bottom: 4px; text-align: justify; }

          .footer-note { font-size: 8pt; text-align: center; margin-top: 40px; font-style: italic; }
        </style>
      </head>
      <body>
        
        <!-- ================= PAGE 1: CARTA RESPONSIVA ================= -->
        <div class="responsiva-container">
          <table class="header-table">
            <tr>
              <td class="header-logo-cell">
                 <img src="/logoAnexoCarso.png" style="max-width:100px; max-height:50px;" alt="Logo" />
              </td>
              <td class="header-title-cell">
                SISTEMA DE GESTIÓN<br>
                PROCISA ECUADOR S.A<br><br>
                <span style="font-weight:normal; font-size:10pt;">FORMATO PARA CARTA RESPONSIVA DE EQUIPO</span>
              </td>
              <td class="header-info-cell">
                <strong>Código:</strong> FR-SI-12<br>
                <strong>Fecha de Emisión:</strong> ${fechaCorta}<br>
                <strong>Página 1 de 1</strong>
              </td>
            </tr>
          </table>

          <p class="text-justify mb-4" style="font-size: 9pt;">
            Recibí el siguiente equipo de cómputo propiedad de PROCISA ECUADOR S.A. para su uso durante la jornada laboral y actividades competentes a mi trabajo, dentro y fuera de las instalaciones de la empresa.
          </p>

          <table class="eq-table">
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Descripción</th>
                <th>No. De Serie</th>
                <th>Cargador</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${equipo.tipo_nombre}</td>
                <td>
                  ${equipo.marca} ${equipo.modelo}<br>
                  <span style="font-size:8pt; color:#333;">${observacionesEquipo}</span>
                </td>
                <td>${equipo.numero_serie}</td>
                <td>${serieCargador}</td>
              </tr>
            </tbody>
          </table>

          <div class="mb-4" style="font-size: 9pt;">
            Con la presente el usuario: <strong>${usuario.nombre_completo}</strong> con No. de empleado: <strong>${usuario.numero_empleado || 'S/N'}</strong><br>
            Perteneciente al área de: <strong>${usuario.departamento_nombre || 'General'}</strong> se responsabiliza de su correcto uso y cuidado. Además de aplicar las siguientes recomendaciones:
          </div>

          <div class="responsiva-section-title">Para equipos de cómputo</div>
          <ul class="responsiva-list">
            <li>Cuidar el uso del equipo en lugares públicos, bloqueando la sesión cuando esté desatendido.</li>
            <li>Antes de ingresar a un dispositivo de almacenamiento deberá ser analizado por el antivirus, el cual en ningún caso se podrá desactivar.</li>
            <li>Se deberá utilizar ONEDRIVE para respaldar la información.</li>
            <li>Se deberá minimizar la conexión en redes públicas o inseguras.</li>
            <li>El equipo conferido debe ser cuidado de cualquier daño físico, lógico y/o extravío.</li>
            <li>Está prohibida la instalación de cualquier software gratuito o de origen desconocido.</li>
            <li>La información que sea procesada en el equipo deberá estar exclusivamente relacionada con las actividades conferidas y podrá ser sujeta de auditoría en cualquier momento.</li>
            <li>Será necesario que el mantenimiento del equipo sea solicitado al área de Tecnología.</li>
          </ul>

          <div class="responsiva-section-title">Otros activos</div>
          <ul class="responsiva-list">
            <li>Cuidar el uso del activo en lugares públicos.</li>
            <li>El activo conferido debe ser cuidado de cualquier daño físico, lógico y/o extravío.</li>
            <li>En el caso de activos que procesen o almacenen información deberá estar exclusivamente relacionada con las actividades conferidas y podrá ser sujeta de auditoría en cualquier momento.</li>
          </ul>

          <div class="anexo-footer">
             <div style="border-top: 1px solid #000; width: 250px; padding-top: 5px; margin-top:40px;"></div>
             <div class="text-bold">${usuario.nombre_completo}</div>
             <div>${usuario.departamento_nombre || ''}</div>
          </div>
          <div class="footer-note">COPIA NO CONTROLADA UNA VEZ IMPRESA</div>
        </div>

        <div class="page-break"></div>

        <!-- ================= PAGE 2: ANEXO 1 ================= -->
        <div class="anexo-container">
          <div class="anexo-header">
            <img src="/logoAnexoCarso.png" class="logo-img" alt="Logo" onerror="this.style.display='none';" />
            <div class="anexo-label">Anexo 1</div>
          </div>

          <div class="anexo-title">
            CARTA DE NO INCLUSION DE SOFTWARE<br>
            DECLARACION DEL EMPLEADO
          </div>

          <div class="mb-4">Guayaquil., ${fechaAsignacion}</div>
          <div class="mb-4 text-bold">Sr./ Sra./ Srita.: ${usuario.nombre_completo}</div>
          <div class="text-justify">
            <p>PRESENTE.</p>
            <p>Con motivo de los conocimientos de que usted dispone en materia de uso de equipo y programas de cómputo y en virtud de que esta empresa posee su propio equipo y frecuentemente adquiere ó desarrolla programas y material diverso de cómputo, a los cuales usted tiene ó puede llegar a tener acceso en el desempeño de sus funciones dentro de la empresa, hacemos de su conocimiento lo siguiente:</p>
            <p>1. Las leyes de la materia y los tratados internacionales prohíben el uso de los programas de cómputo y de cualquier información al respecto, sin el consentimiento de su legítimo propietario ó licenciatario.</p>
            <p>2. Lo anterior implica que usted deberá utilizar única y exclusivamente los equipos y programas de cómputo que la empresa proporcione para el desempeño de sus funciones dentro de la misma empresa.</p>
            <p>3. En consecuencia, deberá usted abstenerse de utilizar y/o ingresar a las instalaciones y/o equipo de cómputo de la empresa programas de cómputo propiedad de terceros que no hayan sido adquiridos por la empresa, así como copiar al equipo de cómputo de la Empresa, archivos no utilizables en el desempeño de sus funciones, por ejemplo: protectores de pantalla, mp3, videojuegos, fotografías, etc.</p>
            <p>4. Asimismo, deberá usted abstenerse de copiar y sustraer cualquier programa adquirido ó desarrollado por la empresa, ya que estos son propiedad exclusiva de la misma.</p>
            <p>5.- Deberá mantener estricta confidencialidad de la información de la Empresa que en el desempeño de sus funciones conozca y en ningún caso y bajo ningún concepto podrá usted divulgarla.</p>
            <p>6. Igualmente, le está prohibido permitir que terceras personas realicen las conductas anteriores ó tengan acceso, de cualquier manera, al equipo de programas de propiedad de la empresa.</p>
            <p>7. La contravención de estas disposiciones será causa de rescisión al contrato de trabajo celebrado entre la empresa y usted, sin que tal medida le exonere de la responsabilidad personal en que llegará a incurrir de acuerdo con las leyes y tratados internacionales aplicables.</p>
          </div>
          <div class="anexo-footer">
            <div class="signature-line">Nombre y Firma de Conformidad</div>
            <div>${usuario.nombre_completo}</div>
            <div>${usuario.departamento_nombre || 'Departamento no asignado'}</div>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Genera el string HTML del Acta de Recepción / Devolución
 */
export const getReceptionDocumentHTML = (usuario: Usuario, equipo: Equipo, fechaRecepcion: string, observaciones: string, licenciasLiberadas: string[] = []): string => {
  const fechaCorta = new Date().toLocaleDateString('es-ES');

  let licenciasHtml = '';
  if (licenciasLiberadas.length > 0) {
      licenciasHtml = `
      <div class="section">
         <div class="label" style="width: 100%; margin-bottom: 5px; font-weight: bold;">Licencias de Software Liberadas:</div>
         <ul style="margin-top: 5px; font-size: 10pt; padding-left: 20px;">
            ${licenciasLiberadas.map(l => `<li>${l}</li>`).join('')}
         </ul>
         <p style="font-size: 8pt; color: #666; margin-top:5px; font-style: italic;">
            * El usuario ha entregado las credenciales y/o declara que ya no tiene acceso a estos recursos de software.
         </p>
      </div>
      `;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Acta de Recepción</title>
        <style>
          @page { size: A4 portrait; margin: 2cm; }
          body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000; margin: 0; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .logo-box { text-align: left; margin-bottom: 10px; }
          .title { font-weight: bold; font-size: 14pt; text-transform: uppercase; margin-bottom: 5px; }
          .subtitle { font-size: 10pt; font-weight: bold; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; display: inline-block; width: 150px; }
          .table-container { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 10pt; }
          th { background-color: #f2f2f2; font-weight: bold; }
          
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          .info-item { margin-bottom: 5px; }
          
          .signatures { margin-top: 100px; display: flex; justify-content: space-between; page-break-inside: avoid; }
          .sig-box { width: 45%; text-align: center; }
          .sig-line { border-top: 1px solid #000; margin-bottom: 5px; margin-top: 50px; }
          .sig-role { font-size: 9pt; font-weight: bold; margin-bottom: 2px; }
          .sig-name { font-size: 10pt; }
          
          .footer-note { font-size: 8pt; text-align: center; margin-top: 50px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
           <div class="logo-box">
              <img src="/logoAnexoCarso.png" style="max-height: 50px;" alt="Logo" onerror="this.style.display='none';"/>
           </div>
           <div class="title">ACTA DE RECEPCIÓN / DEVOLUCIÓN DE EQUIPO</div>
           <div class="subtitle">DEPARTAMENTO DE TECNOLOGÍA</div>
           <div style="text-align: right; margin-top: 10px; font-size: 9pt;">Fecha Impresión: ${fechaCorta}</div>
        </div>

        <div class="section">
           <p style="text-align: justify;">
             Por medio de la presente se hace constar la devolución del equipo de cómputo y/o periféricos asignados al colaborador, detallando a continuación las características y el estado de los mismos.
           </p>
        </div>

        <div class="section" style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd;">
           <div class="info-grid">
              <div class="info-item"><span class="label">Fecha Recepción:</span> ${fechaRecepcion}</div>
              <div class="info-item"><span class="label">Ubicación:</span> ${equipo.ubicacion_nombre || 'Bodega IT'}</div>
              <div class="info-item"><span class="label">Usuario Devuelve:</span> ${usuario.nombre_completo}</div>
              <div class="info-item"><span class="label">Departamento:</span> ${usuario.departamento_nombre || 'N/A'}</div>
           </div>
        </div>

        <div class="table-container">
           <h3>Detalle del Equipo</h3>
           <table>
              <thead>
                 <tr>
                    <th style="width: 20%;">Tipo</th>
                    <th style="width: 20%;">Marca</th>
                    <th style="width: 30%;">Modelo</th>
                    <th style="width: 30%;">Serie / Código</th>
                 </tr>
              </thead>
              <tbody>
                 <tr>
                    <td>${equipo.tipo_nombre}</td>
                    <td>${equipo.marca}</td>
                    <td>${equipo.modelo}</td>
                    <td>
                      <strong>Serie:</strong> ${equipo.numero_serie}<br>
                      <strong>Activo:</strong> ${equipo.codigo_activo}
                    </td>
                 </tr>
              </tbody>
           </table>
        </div>

        <div class="section">
           <div class="label" style="width: 100%; margin-bottom: 5px; font-weight: bold;">Observaciones / Estado del Equipo:</div>
           <div style="border: 1px solid #000; padding: 10px; min-height: 80px; font-style: italic;">
              ${observaciones || 'El equipo se recibe funcionando correctamente, con sus accesorios completos.'}
           </div>
        </div>

        ${licenciasHtml}

        <div class="signatures">
           <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-role">ENTREGADO POR (USUARIO)</div>
              <div class="sig-name">${usuario.nombre_completo}</div>
              <div class="sig-name" style="font-size: 8pt;">C.I. / Empleado: ${usuario.numero_empleado || '__________'}</div>
           </div>
           <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-role">RECIBIDO POR (IT)</div>
              <div class="sig-name">Administrador de Inventario</div>
              <div class="sig-name" style="font-size: 8pt;">Departamento de Tecnología</div>
           </div>
        </div>
        
        <div class="footer-note">
           Este documento certifica la devolución del activo fijo propiedad de la empresa.
        </div>
      </body>
    </html>
  `;
};

/**
 * Genera el string HTML del Acta de Baja
 */
export const getDisposalDocumentHTML = (equipo: Equipo, motivo: string): string => {
  const fechaCorta = new Date().toLocaleDateString('es-ES');
  const fechaCompleta = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Acta de Baja Técnica</title>
        <style>
          @page { size: A4 portrait; margin: 2cm; }
          body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000; margin: 0; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .title { font-weight: bold; font-size: 16pt; text-transform: uppercase; margin-bottom: 5px; }
          .subtitle { font-size: 11pt; font-weight: bold; color: #444; }
          
          .section-box { border: 1px solid #000; padding: 10px; margin-bottom: 15px; }
          .box-title { background: #eee; padding: 5px; border-bottom: 1px solid #000; font-weight: bold; margin: -10px -10px 10px -10px; text-align:center; font-size:10pt;}
          
          table { width: 100%; border-collapse: collapse; }
          td { padding: 5px; vertical-align: top; }
          .label { font-weight: bold; width: 140px; display:inline-block; }
          
          .reason-box { border: 1px solid #000; padding: 15px; min-height: 100px; margin: 10px 0; background-color: #fafafa; }
          
          .signatures { margin-top: 80px; display: flex; justify-content: space-between; page-break-inside: avoid; }
          .sig-box { width: 45%; text-align: center; }
          .sig-line { border-top: 1px solid #000; margin-bottom: 5px; margin-top: 50px; }
          .sig-role { font-size: 9pt; font-weight: bold; margin-bottom: 2px; }
          
          .footer-note { font-size: 8pt; text-align: center; margin-top: 50px; color: #666; border-top: 1px solid #ddd; padding-top:10px;}
        </style>
      </head>
      <body>
        <div class="header">
           <img src="/logoAnexoCarso.png" style="max-height: 50px; float:left;" alt="Logo" onerror="this.style.display='none';"/>
           <div class="title">INFORME TÉCNICO DE BAJA</div>
           <div class="subtitle">DEPARTAMENTO DE SISTEMAS</div>
           <div style="clear:both;"></div>
        </div>

        <p style="text-align: right; font-size: 10pt;">
           <strong>Fecha:</strong> ${fechaCompleta}
        </p>

        <div class="section-box">
           <div class="box-title">DATOS DEL EQUIPO</div>
           <table>
              <tr>
                 <td><span class="label">Código Activo:</span> ${equipo.codigo_activo}</td>
                 <td><span class="label">Fecha Compra:</span> ${equipo.fecha_compra}</td>
              </tr>
              <tr>
                 <td><span class="label">Tipo:</span> ${equipo.tipo_nombre}</td>
                 <td><span class="label">Marca:</span> ${equipo.marca}</td>
              </tr>
              <tr>
                 <td><span class="label">Modelo:</span> ${equipo.modelo}</td>
                 <td><span class="label">Serie:</span> ${equipo.numero_serie}</td>
              </tr>
           </table>
        </div>

        <div style="margin-bottom: 5px; font-weight: bold;">DIAGNÓSTICO TÉCNICO / MOTIVO DE BAJA:</div>
        <div class="reason-box">
           ${motivo}
        </div>

        <p style="text-align: justify; font-size: 10pt; margin-top: 20px;">
           Tras la revisión técnica realizada, se determina que el equipo detallado anteriormente ya no cumple con las condiciones operativas necesarias para su funcionamiento dentro de la organización, o su reparación resulta económicamente inviable. Por lo tanto, se recomienda su <strong>BAJA DEFINITIVA</strong> del inventario de activos fijos.
        </p>

        <div class="signatures">
           <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-role">ELABORADO POR (SOPORTE TÉCNICO)</div>
              <div style="font-size: 9pt;">Firma y Sello</div>
           </div>
           <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-role">APROBADO POR (JEFATURA)</div>
              <div style="font-size: 9pt;">Firma y Sello</div>
           </div>
        </div>
        
        <div class="footer-note">
           Documento generado por el Sistema InvenTory - Control de Activos
        </div>
      </body>
    </html>
  `;
};

/**
 * Genera el documento de asignación y abre la ventana de impresión
 */
export const generateAssignmentDocument = (usuario: Usuario, equipo: Equipo) => {
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    Swal.fire({
      title: 'Ventana Emergente Bloqueada',
      text: 'Por favor permite las ventanas emergentes (pop-ups) para ver el documento de asignación.',
      icon: 'warning',
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  const htmlContent = getAssignmentDocumentHTML(usuario, equipo);
  
  // Agregar script de autoimpresión al HTML
  const printScript = `<script>window.onload = function() { setTimeout(function(){ window.print(); }, 800); }</script>`;
  const fullHtml = htmlContent.replace('</body>', `${printScript}</body>`);

  printWindow.document.write(fullHtml);
  printWindow.document.close();
};

/**
 * Genera el documento de recepción/devolución y abre la ventana de impresión
 */
export const generateReceptionDocument = (usuario: Usuario, equipo: Equipo, observaciones: string, licenciasLiberadas: string[] = []) => {
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    Swal.fire({
      title: 'Ventana Emergente Bloqueada',
      text: 'Por favor permite las ventanas emergentes (pop-ups) para ver el documento.',
      icon: 'warning',
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  const fechaRecepcion = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const htmlContent = getReceptionDocumentHTML(usuario, equipo, fechaRecepcion, observaciones, licenciasLiberadas);
  
  const printScript = `<script>window.onload = function() { setTimeout(function(){ window.print(); }, 800); }</script>`;
  const fullHtml = htmlContent.replace('</body>', `${printScript}</body>`);

  printWindow.document.write(fullHtml);
  printWindow.document.close();
};

/**
 * Genera el documento de baja y abre la ventana de impresión
 */
export const generateDisposalDocument = (equipo: Equipo, motivo: string) => {
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    Swal.fire({
      title: 'Ventana Emergente Bloqueada',
      text: 'Por favor permite las ventanas emergentes (pop-ups) para ver el documento.',
      icon: 'warning',
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  const htmlContent = getDisposalDocumentHTML(equipo, motivo);
  const printScript = `<script>window.onload = function() { setTimeout(function(){ window.print(); }, 800); }</script>`;
  const fullHtml = htmlContent.replace('</body>', `${printScript}</body>`);

  printWindow.document.write(fullHtml);
  printWindow.document.close();
};

export const printCustomHTML = (htmlContent: string, title: string) => {
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) return;
  printWindow.document.write(`<html><head><title>${title}</title></head><body>${htmlContent}<script>window.onload=function(){window.print();}</script></body></html>`);
  printWindow.document.close();
};

export const openPrintPreview = (html: string) => {
    printCustomHTML(html, 'Vista Previa');
};

export const generateServiceOrder = (equipo: Equipo, data: any) => {
    const html = `
      <html>
      <head>
        <title>Orden de Servicio</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; margin-bottom: 20px; padding-bottom: 10px; }
          .title { font-size: 20px; font-weight: bold; }
          .info { margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #f0f0f0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">ORDEN DE SERVICIO TÉCNICO</div>
          <div>Departamento de Tecnología</div>
        </div>
        <div class="info">
          <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Equipo:</strong> ${equipo.tipo_nombre} - ${equipo.marca} ${equipo.modelo}</p>
          <p><strong>Código:</strong> ${equipo.codigo_activo}</p>
          <p><strong>Serie:</strong> ${equipo.numero_serie}</p>
        </div>
        <table>
          <tr><th>Tipo de Servicio</th><td>${data.tipo}</td></tr>
          <tr><th>Proveedor / Técnico</th><td>${data.proveedor}</td></tr>
          <tr><th>Costo Estimado</th><td>$${data.costo}</td></tr>
          <tr><th>Descripción del Trabajo</th><td>${data.descripcion}</td></tr>
        </table>
        <br><br>
        <div style="display:flex; justify-content:space-between; margin-top:50px;">
           <div style="border-top:1px solid #000; width:40%; text-align:center;">Firma Técnico / Proveedor</div>
           <div style="border-top:1px solid #000; width:40%; text-align:center;">Firma Supervisor IT</div>
        </div>
      </body>
      </html>
    `;
    printCustomHTML(html, 'Orden de Servicio');
}
