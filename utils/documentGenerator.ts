
import { Usuario, Equipo, PlanRecambio, DetallePlanRecambio } from '../types';
import { formatCurrency } from './formatters';
import Swal from 'sweetalert2';

/**
 * Genera el reporte de stock completo en HTML para PDF (Ajustado a A4 Vertical)
 */
export const getStockReportHTML = (equipos: Equipo[]): string => {
  const brandBlue = '#1e3a8a';
  const brandOrange = '#ea580c';
  const fechaHoy = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  // Calcular Resumen de Stock
  const summary: Record<string, Record<string, number>> = {};
  equipos.forEach(eq => {
    const t = eq.tipo_nombre || 'Otros';
    const s = eq.estado;
    if (!summary[t]) summary[t] = {};
    summary[t][s] = (summary[t][s] || 0) + 1;
  });

  // Agrupar para el reporte PDF (Cuerpo de la tabla)
  const grouped = equipos.reduce((acc, eq) => {
    const type = eq.tipo_nombre || 'Otros';
    if (!acc[type]) acc[type] = [];
    acc[type].push(eq);
    return acc;
  }, {} as Record<string, Equipo[]>);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reporte de Stock de Inventario IT</title>
        <style>
          @page { size: A4 portrait; margin: 1cm; }
          body { font-family: 'Inter', Arial, sans-serif; color: #1e293b; font-size: 7.5pt; line-height: 1.25; margin: 0; }
          
          .header { border-bottom: 2px solid ${brandBlue}; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
          .header-title { font-weight: 800; color: ${brandBlue}; font-size: 13pt; text-transform: uppercase; margin: 0; }
          .header-meta { text-align: right; font-size: 7.5pt; color: #64748b; }
          
          .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin-bottom: 15px; }
          .summary-title { font-weight: 700; font-size: 7pt; text-transform: uppercase; color: ${brandBlue}; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
          .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .summary-item { display: flex; flex-direction: column; gap: 1px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 3px; }
          .summary-type { font-weight: 700; font-size: 7pt; color: #334155; }
          .summary-details { display: flex; flex-wrap: wrap; gap: 4px; font-size: 6.5pt; }
          .badge-s { background: #fff; padding: 0px 4px; border-radius: 3px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569; }

          .stats-row { display: flex; gap: 8px; margin-bottom: 15px; }
          .stat-card { border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 4px; background: #f8fafc; border-left: 3px solid ${brandOrange}; flex: 1; }
          .stat-label { font-size: 6.5pt; font-weight: 700; color: #64748b; text-transform: uppercase; }
          .stat-value { font-size: 10pt; font-weight: 800; color: #0f172a; }

          .type-section { margin-bottom: 15px; page-break-inside: avoid; }
          .type-header { background: ${brandBlue}; color: white; padding: 4px 10px; font-weight: 800; text-transform: uppercase; font-size: 8pt; display: flex; justify-content: space-between; }
          
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th { background-color: #f1f5f9; color: #475569; font-weight: 700; text-transform: uppercase; text-align: left; padding: 5px 6px; border-bottom: 1px solid #cbd5e1; font-size: 6.5pt; }
          td { padding: 5px 6px; border-bottom: 1px solid #f1f5f9; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; }
          
          .code { font-weight: 700; color: #0f172a; }
          .specs { color: #475569; font-size: 6.5pt; }
          .status-tag { display: inline-block; padding: 1px 3px; border-radius: 3px; font-size: 6pt; font-weight: 700; text-transform: uppercase; background: #f1f5f9; border: 1px solid #e2e8f0; }

          .footer { margin-top: 15px; text-align: center; font-size: 6.5pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="header-title">Inventario Consolidado IT</h1>
            <div style="color: ${brandOrange}; font-weight: 700; font-size: 8pt;">Stock Operativo Actualizado</div>
          </div>
          <div class="header-meta">
            <strong>Emitido:</strong> ${fechaHoy}<br>
            <strong>Total Activos:</strong> ${equipos.length}
          </div>
        </div>

        <div class="summary-box">
           <div class="summary-title">Conteo por Categoría y Estado</div>
           <div class="summary-grid">
              ${Object.entries(summary).map(([type, states]) => `
                <div class="summary-item">
                   <div class="summary-type">${type}</div>
                   <div class="summary-details">
                      ${Object.entries(states).map(([s, count]) => `
                        <span class="badge-s">${s}: ${count}</span>
                      `).join('')}
                   </div>
                </div>
              `).join('')}
           </div>
        </div>

        <div class="stats-row">
           <div class="stat-card">
              <div class="stat-label">Valor en Libros</div>
              <div class="stat-value">${formatCurrency(equipos.reduce((a,b) => a + (Number(b.valor_compra) || 0), 0))}</div>
           </div>
           <div class="stat-card" style="border-left-color: #3b82f6;">
              <div class="stat-label">En Uso (Activos)</div>
              <div class="stat-value">${equipos.filter(e => e.estado === 'Activo').length}</div>
           </div>
           <div class="stat-card" style="border-left-color: #10b981;">
              <div class="stat-label">Disponibles</div>
              <div class="stat-value">${equipos.filter(e => e.estado === 'Disponible').length}</div>
           </div>
        </div>

        ${Object.entries(grouped).map(([type, items]) => `
          <div class="type-section">
            <div class="type-header">
               <span>${type}</span>
               <span>${items.length} Unidades</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 20%">Código / Serie</th>
                  <th style="width: 20%">Marca / Modelo</th>
                  <th style="width: 12%">Estado</th>
                  <th style="width: 23%">Responsable</th>
                  <th style="width: 25%">Ficha Técnica</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(eq => `
                  <tr>
                    <td>
                       <div class="code">${eq.codigo_activo}</div>
                       <div style="color:#64748b; font-size:6pt;">SN: ${eq.numero_serie}</div>
                    </td>
                    <td>
                       <div style="font-weight:600;">${eq.marca}</div>
                       <div style="color:#64748b;">${eq.modelo}</div>
                    </td>
                    <td><span class="status-tag">${eq.estado}</span></td>
                    <td>
                       ${eq.responsable_nombre ? `<div style="font-weight:600;">${eq.responsable_nombre}</div><div style="font-size:6pt; color:#64748b;">${eq.ubicacion_nombre}</div>` : '<span style="color:#94a3b8; font-style:italic;">En Bodega</span>'}
                    </td>
                    <td class="specs">
                       ${eq.procesador ? `
                         <div><strong>CPU:</strong> ${eq.procesador}</div>
                         <div><strong>RAM:</strong> ${eq.ram} | <strong>Disk:</strong> ${eq.disco_capacidad}</div>
                         <div style="color:${brandBlue};"><strong>S.O:</strong> ${eq.sistema_operativo || 'N/A'}</div>
                       ` : '---'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}

        <div class="footer">
          Documento generado automáticamente por Sistema InvenTory - Gestión de Activos de Red y Cómputo.
        </div>
      </body>
    </html>
  `;
};

/**
 * Dispara la generación del PDF de Stock (Ajustado a Vertical)
 */
export const generateStockReportPDF = (equipos: Equipo[]) => {
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    Swal.fire('Error', 'Ventana emergente bloqueada. Por favor habilítalas.', 'warning');
    return;
  }

  const htmlContent = getStockReportHTML(equipos);
  const printScript = `<script>window.onload = function() { setTimeout(function(){ window.print(); }, 800); }</script>`;
  const fullHtml = htmlContent.replace('</body>', `${printScript}</body>`);

  printWindow.document.write(fullHtml);
  printWindow.document.close();
};

/**
 * Genera el string HTML del documento de asignación (Carta Responsiva + Anexo 1)
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
 * Genera el string HTML del Acta de Recepción / Devolución estilizada
 */
export const getReceptionDocumentHTML = (usuario: Usuario, equipo: Equipo, fechaRecepcion: string, observaciones: string, licenciasLiberadas: string[] = []): string => {
  const brandBlue = '#1e3a8a';
  const brandOrange = '#ea580c';
  const fechaHoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  let licenciasHtml = '';
  if (licenciasLiberadas.length > 0) {
      licenciasHtml = `
      <div class="section-box" style="margin-top: 20px;">
         <div class="box-title">
            <span>Control de Software y Licencias</span>
         </div>
         <div style="padding: 15px;">
            <p style="font-size: 9pt; margin-bottom: 10px; color: #475569;">Las siguientes licencias vinculadas al usuario han sido liberadas o deshabilitadas:</p>
            <ul style="margin: 0; padding-left: 20px; font-size: 9pt; color: ${brandBlue}; font-weight: 600;">
               ${licenciasLiberadas.map(l => `<li style="margin-bottom: 3px;">${l}</li>`).join('')}
            </ul>
         </div>
      </div>
      `;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Acta de Recepción Técnica</title>
        <style>
          @page { size: A4 portrait; margin: 1.5cm; }
          body { font-family: 'Inter', Arial, sans-serif; font-size: 10pt; line-height: 1.5; color: #334155; margin: 0; }
          
          .header { 
              text-align: center; 
              margin-bottom: 25px; 
              border-bottom: 3px solid ${brandBlue}; 
              padding-bottom: 15px;
              position: relative;
          }
          .logo-top { max-height: 45px; position: absolute; left: 0; top: 0; }
          .title { 
              font-weight: 800; 
              font-size: 16pt; 
              text-transform: uppercase; 
              margin: 0;
              color: ${brandBlue};
          }
          .subtitle { 
              font-size: 9pt; 
              font-weight: 600; 
              color: ${brandOrange}; 
              text-transform: uppercase;
              margin-top: 4px;
          }
          
          .meta-info { text-align: right; font-size: 8.5pt; color: #64748b; margin-bottom: 15px; }
          
          .section-box { 
              border: 1.5px solid ${brandBlue}; 
              border-radius: 8px;
              overflow: hidden;
              margin-bottom: 20px; 
          }
          .box-title { 
              background: ${brandBlue}; 
              padding: 6px 15px; 
              font-weight: 700; 
              color: white; 
              font-size: 9pt;
              text-transform: uppercase;
              display: flex;
              justify-content: space-between;
              border-bottom: 2.5px solid ${brandOrange};
          }
          
          table.data-table { width: 100%; border-collapse: collapse; background-color: #fff; }
          table.data-table td { padding: 10px 15px; vertical-align: top; border-bottom: 1px solid #f1f5f9; font-size: 9pt; }
          table.data-table tr:last-child td { border-bottom: none; }
          
          .label { font-weight: 700; color: ${brandBlue}; width: 120px; display: inline-block; font-size: 8.5pt; text-transform: uppercase; }
          .value { color: #1e293b; font-weight: 500; }
          
          .obs-title { 
              font-weight: 800; 
              margin-bottom: 8px; 
              color: ${brandBlue}; 
              font-size: 9.5pt;
              display: flex;
              align-items: center;
              gap: 8px;
          }
          .obs-box { 
              border: 1px solid #e2e8f0; 
              border-left: 4px solid ${brandOrange};
              padding: 15px; 
              min-height: 80px; 
              margin: 8px 0 20px 0; 
              background-color: #f8fafc; 
              border-radius: 0 6px 6px 0;
              font-style: italic;
              color: #475569;
              font-size: 9pt;
          }

          .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 5px; }
          .spec-item { font-size: 8pt; color: #64748b; border-bottom: 1px dashed #e2e8f0; padding-bottom: 2px; }
          
          .signatures { 
              margin-top: 60px; 
              display: flex; 
              justify-content: space-between; 
              page-break-inside: avoid; 
          }
          .sig-box { width: 45%; text-align: center; }
          .sig-line { border-top: 2px solid ${brandBlue}; margin-bottom: 8px; margin-top: 50px; width: 85%; margin-left: auto; margin-right: auto; }
          .sig-role { font-size: 8pt; font-weight: 800; color: ${brandBlue}; text-transform: uppercase; }
          .sig-name { font-size: 9pt; font-weight: 600; color: #1e293b; margin-top: 4px; }
          
          .footer-note { 
              font-size: 7.5pt; 
              text-align: center; 
              margin-top: 50px; 
              color: #94a3b8; 
              border-top: 1px solid #f1f5f9; 
              padding-top: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
           <img src="/logoAnexoCarso.png" class="logo-top" alt="Logo" onerror="this.style.display='none';"/>
           <div class="title">Acta de Recepción de Equipo</div>
           <div class="subtitle">Departamento de Tecnología e Infraestructura</div>
        </div>

        <div class="meta-info">
           <strong>Fecha Emisión:</strong> ${fechaHoy}
        </div>

        <div class="section-box">
           <div class="box-title">
              <span>Información del Colaborador</span>
           </div>
           <table class="data-table">
              <tr>
                 <td style="width: 50%; border-right: 1px solid #f1f5f9;">
                    <span class="label">Usuario:</span> <span class="value">${usuario.nombre_completo}</span>
                 </td>
                 <td>
                    <span class="label">Departamento:</span> <span class="value">${usuario.departamento_nombre || 'N/A'}</span>
                 </td>
              </tr>
              <tr>
                 <td style="border-right: 1px solid #f1f5f9;">
                    <span class="label">ID Empleado:</span> <span class="value">${usuario.numero_empleado || 'S/N'}</span>
                 </td>
                 <td>
                    <span class="label">Sede:</span> <span class="value">${equipo.ubicacion_nombre || 'BODEGA IT'}</span>
                 </td>
              </tr>
           </table>
        </div>

        <div class="section-box">
           <div class="box-title">
              <span>Detalles Técnicos del Activo</span>
              <span style="font-size: 8pt; opacity: 0.9;">Cod: ${equipo.codigo_activo}</span>
           </div>
           <table class="data-table">
              <tr>
                 <td style="width: 50%; border-right: 1px solid #f1f5f9;">
                    <span class="label">Equipo:</span> <span class="value">${equipo.tipo_nombre} ${equipo.marca}</span>
                 </td>
                 <td>
                    <span class="label">Modelo:</span> <span class="value">${equipo.modelo}</span>
                 </td>
              </tr>
              <tr>
                 <td style="border-right: 1px solid #f1f5f9;">
                    <span class="label">No. Serie:</span> <span class="value">${equipo.numero_serie}</span>
                 </td>
                 <td>
                    <span class="label">Cargador:</span> <span class="value">${equipo.serie_cargador || 'S/N'}</span>
                 </td>
              </tr>
              ${equipo.procesador ? `
              <tr>
                 <td colspan="2">
                    <div class="specs-grid">
                        <div class="spec-item"><strong>CPU:</strong> ${equipo.procesador}</div>
                        <div class="spec-item"><strong>RAM:</strong> ${equipo.ram}</div>
                        <div class="spec-item"><strong>Disco:</strong> ${equipo.disco_capacidad} ${equipo.disco_tipo}</div>
                        <div class="spec-item"><strong>S.O:</strong> ${equipo.sistema_operativo}</div>
                    </div>
                 </td>
              </tr>` : ''}
           </table>
        </div>

        <div class="obs-title">OBSERVACIONES Y ESTADO DE RECEPCIÓN</div>
        <div class="obs-box">
           ${observaciones || 'El equipo se recibe para reingreso a bodega en condiciones operativas estándar, sin daños físicos aparentes reportados fuera del desgaste normal por uso.'}
        </div>

        ${licenciasHtml}

        <div style="margin-top: 25px; font-size: 8.5pt; text-align: justify; color: #64748b; background: #f1f5f9; padding: 10px; border-radius: 6px;">
           <strong>DECLARACIÓN:</strong> El colaborador hace entrega formal del activo descrito, reconociendo que la información institucional contenida en el mismo queda bajo resguardo del departamento de tecnología. El departamento de TI validará posteriormente el estado funcional interno para su posible reasignación o mantenimiento preventivo.
        </div>

        <div class="signatures">
           <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-role">Entrega (Colaborador)</div>
              <div class="sig-name">${usuario.nombre_completo}</div>
           </div>
           <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-role">Recibe (Responsable IT)</div>
              <div class="sig-name">Soporte Técnico e Inventario</div>
           </div>
        </div>
        
        <div class="footer-note">
           Documento electrónico generado por el Sistema InvenTory - Gestión de Activos Fijos IT<br>
           &copy; ${new Date().getFullYear()} - Procisa Ecuador S.A.
        </div>
      </body>
    </html>
  `;
};

/**
 * Genera el string HTML del Acta de Baja con colores institucionales
 */
export const getDisposalDocumentHTML = (equipo: Equipo, motivo: string): string => {
  const fechaCompleta = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const brandBlue = '#1e3a8a';
  const brandOrange = '#ea580c';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Acta de Baja Técnica</title>
        <style>
          @page { size: A4 portrait; margin: 2cm; }
          body { font-family: 'Inter', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #334155; margin: 0; }
          
          .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 3px solid ${brandBlue}; 
              padding-bottom: 15px; 
              position: relative;
          }
          .title { 
              font-weight: 800; 
              font-size: 18pt; 
              text-transform: uppercase; 
              margin: 0;
              color: ${brandBlue};
              letter-spacing: 1px;
          }
          .subtitle { 
              font-size: 10pt; 
              font-weight: 600; 
              color: ${brandOrange}; 
              text-transform: uppercase;
              margin-top: 5px;
          }
          
          .meta-info { text-align: right; font-size: 9pt; color: #64748b; margin-bottom: 20px; }
          
          .section-box { 
              border: 1.5px solid ${brandBlue}; 
              border-radius: 8px;
              overflow: hidden;
              margin-bottom: 25px; 
          }
          .box-title { 
              background: ${brandBlue}; 
              padding: 8px 15px; 
              font-weight: 700; 
              color: white; 
              font-size: 10pt;
              text-transform: uppercase;
              display: flex;
              justify-content: space-between;
              border-bottom: 3px solid ${brandOrange};
          }
          
          table.data-table { width: 100%; border-collapse: collapse; background-color: #fff; }
          table.data-table td { padding: 12px 15px; vertical-align: top; border-bottom: 1px solid #f1f5f9; }
          table.data-table tr:last-child td { border-bottom: none; }
          
          .label { font-weight: 700; color: ${brandBlue}; width: 130px; display: inline-block; font-size: 9pt; text-transform: uppercase; }
          .value { color: #1e293b; font-weight: 500; }
          
          .reason-section-title { 
              font-weight: 800; 
              margin-bottom: 8px; 
              color: ${brandBlue}; 
              font-size: 10pt;
              display: flex;
              align-items: center;
              gap: 8px;
          }
          .reason-section-title::after {
              content: "";
              flex: 1;
              height: 1px;
              background-color: #e2e8f0;
          }
          
          .reason-box { 
              border: 1px solid #e2e8f0; 
              border-left: 5px solid ${brandOrange};
              padding: 20px; 
              min-height: 120px; 
              margin: 10px 0 25px 0; 
              background-color: #f8fafc; 
              border-radius: 0 6px 6px 0;
              font-style: italic;
              color: #475569;
          }
          
          .declaration { 
              text-align: justify; 
              font-size: 10pt; 
              color: #334155; 
              background: #fffbeb; 
              padding: 15px; 
              border-radius: 8px; 
              border: 1px solid #fef3c7;
              line-height: 1.6;
          }
          
          .signatures { 
              margin-top: 80px; 
              display: flex; 
              justify-content: space-between; 
              page-break-inside: avoid; 
          }
          .sig-box { width: 45%; text-align: center; }
          .sig-line { border-top: 2.5px solid ${brandBlue}; margin-bottom: 10px; margin-top: 60px; width: 80%; margin-left: auto; margin-right: auto; }
          .sig-role { font-size: 8.5pt; font-weight: 800; color: ${brandBlue}; text-transform: uppercase; }
          .sig-subtitle { font-size: 8pt; color: #64748b; margin-top: 4px; }
          
          .footer-note { 
              font-size: 8pt; 
              text-align: center; 
              margin-top: 60px; 
              color: #94a3b8; 
              border-top: 1px solid #f1f5f9; 
              padding-top: 15px;
              font-weight: 500;
          }
          .logo-top { max-height: 50px; position: absolute; left: 0; top: 0; }
        </style>
      </head>
      <body>
        <div class="header">
           <img src="/logoAnexoCarso.png" class="logo-top" alt="Logo" onerror="this.style.display='none';"/>
           <div class="title">Informe Técnico de Baja</div>
           <div class="subtitle">Gestión de Activos Tecnológicos</div>
        </div>

        <div class="meta-info">
           <strong>Emitido el:</strong> ${fechaCompleta}
        </div>

        <div class="section-box">
           <div class="box-title">
              <span>Especificaciones del Activo</span>
              <span style="font-size: 8pt; opacity: 0.9;">Ref: ${equipo.codigo_activo}</span>
           </div>
           <table class="data-table">
              <tr>
                 <td style="width: 50%; border-right: 1px solid #f1f5f9;">
                    <span class="label">Código Activo:</span> <span class="value">${equipo.codigo_activo}</span>
                 </td>
                 <td>
                    <span class="label">Fecha Compra:</span> <span class="value">${equipo.fecha_compra}</span>
                 </td>
              </tr>
              <tr>
                 <td style="border-right: 1px solid #f1f5f9;">
                    <span class="label">Tipo Equipo:</span> <span class="value">${equipo.tipo_nombre}</span>
                 </td>
                 <td>
                    <span class="label">Marca:</span> <span class="value">${equipo.marca}</span>
                 </td>
              </tr>
              <tr>
                 <td style="border-right: 1px solid #f1f5f9;">
                    <span class="label">Modelo:</span> <span class="value">${equipo.modelo}</span>
                 </td>
                 <td>
                    <span class="label">Serie:</span> <span class="value">${equipo.numero_serie}</span>
                 </td>
              </tr>
           </table>
        </div>

        <div class="reason-section-title">DIAGNÓSTICO TÉCNICO Y JUSTIFICACIÓN</div>
        <div class="reason-box">
           ${motivo}
        </div>

        <div class="declaration">
           <strong>DIRECCIÓN TÉCNICA:</strong> Tras la inspección exhaustiva realizada por el departamento de soporte, se concluye que el equipo descrito presenta un estado de obsolescencia o daños que imposibilitan su operatividad eficiente. El costo de restauración supera el valor residual en libros o no garantiza la estabilidad requerida para los procesos del negocio. Se autoriza proceder con la <strong>DESVINCULACIÓN DEFINITIVA</strong> del inventario activo de la compañía.
        </div>

        <div class="signatures">
           <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-role">Elaborado por</div>
              <div class="sig-subtitle">Especialista de Soporte Técnico IT</div>
           </div>
           <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-role">Autorizado por</div>
              <div class="sig-subtitle">Jefatura / Gerencia de Tecnología</div>
           </div>
        </div>
        
        <div class="footer-note">
           Documento oficial generado por el Sistema InvenTory - Registro de Activos Fijos IT<br>
           &copy; ${new Date().getFullYear()} - Gestión de Infraestructura
        </div>
      </body>
    </html>
  `;
};

/**
 * Genera el documento HTML para un Plan de Recambio Tecnológico
 */
export const getReplacementPlanDocumentHTML = (plan: PlanRecambio, details: DetallePlanRecambio[]): string => {
  const brandBlue = '#1e3a8a';
  const brandOrange = '#ea580c';
  const fechaHoy = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Plan de Recambio Tecnológico ${plan.anio}</title>
        <style>
          @page { size: A4 portrait; margin: 1.5cm; }
          body { font-family: 'Inter', Arial, sans-serif; color: #334155; font-size: 10pt; line-height: 1.4; margin: 0; }
          
          .header { border-bottom: 2px solid ${brandBlue}; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .header-title { font-weight: 800; color: ${brandBlue}; font-size: 16pt; text-transform: uppercase; margin: 0; }
          .header-meta { text-align: right; font-size: 8pt; color: #64748b; }
          
          .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
          .summary-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #f8fafc; border-left: 4px solid ${brandOrange}; }
          .summary-label { font-size: 8pt; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
          .summary-value { font-size: 14pt; font-weight: 800; color: #1e293b; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #f1f5f9; color: ${brandBlue}; font-weight: 700; text-transform: uppercase; text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; font-size: 8.5pt; }
          td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 9pt; }
          
          .asset-code { font-weight: 700; color: #1e293b; }
          .asset-model { font-size: 8pt; color: #64748b; }
          .badge-age { background: #ffedd5; color: #9a3412; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 8pt; }
          
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; font-size: 8pt; color: #94a3b8; }
          .signatures { margin-top: 60px; display: flex; justify-content: space-around; }
          .sig-box { width: 200px; text-align: center; }
          .sig-line { border-top: 1px solid #000; margin-bottom: 5px; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="header-title">Plan de Recambio</h1>
            <div style="color: ${brandOrange}; font-weight: 700; font-size: 10pt;">${plan.nombre}</div>
          </div>
          <div class="header-meta">
            <strong>Generado:</strong> ${fechaHoy}<br>
            <strong>Periodo:</strong> ${plan.anio}
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">Presupuesto Estimado</div>
            <div class="summary-value">${formatCurrency(plan.presupuesto_estimado)}</div>
          </div>
          <div class="summary-card" style="border-left-color: ${brandBlue};">
            <div class="summary-label">Total Activos a Renovar</div>
            <div class="summary-value">${plan.total_equipos} unidades</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Activo / Modelo</th>
              <th>Antigüedad</th>
              <th style="text-align: right;">Costo Reposición (Est)</th>
            </tr>
          </thead>
          <tbody>
            ${details.map(d => `
              <tr>
                <td>
                  <div class="asset-code">${d.equipo_codigo}</div>
                  <div class="asset-model">${d.equipo_marca} ${d.equipo_modelo}</div>
                </td>
                <td>
                  <span class="badge-age">${d.equipo_antiguedad} años</span>
                </td>
                <td style="text-align: right; font-weight: 600;">
                  ${formatCurrency(d.valor_reposicion)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div style="font-weight: 700;">Área de Tecnología</div>
            <div style="font-size: 8pt;">Gestión de Activos</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div style="font-weight: 700;">Área Financiera</div>
            <div style="font-size: 8pt;">Aprobación de Presupuesto</div>
          </div>
        </div>

        <div class="footer">
          Este documento es una propuesta de inversión para mantenimiento de la operatividad tecnológica. <br>
          Generado automáticamente por el Sistema InvenTory.
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

/**
 * Genera el documento del Plan de Recambio y abre la ventana de impresión
 */
export const generateReplacementPlanPDF = (plan: PlanRecambio, details: DetallePlanRecambio[]) => {
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    Swal.fire({
      title: 'Ventana Emergente Bloqueada',
      text: 'Por favor permite las ventanas emergentes (pop-ups) para exportar el PDF.',
      icon: 'warning',
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  const htmlContent = getReplacementPlanDocumentHTML(plan, details);
  const printScript = `<script>window.onload = function() { setTimeout(function(){ window.print(); }, 800); }</script>`;
  const fullHtml = htmlContent.replace('</body>', `${printScript}</body>`);
  printWindow.document.write(fullHtml);
  printWindow.document.close();
};

export const generateServiceOrder = (equipo: Equipo, data: any) => {
    const brandBlue = '#1e3a8a';
    const brandOrange = '#ea580c';
    
    // Calcular cambios en especificaciones técnicas
    const changes: {label: string, old: string, new: string}[] = [];
    if (data.procesador && data.procesador !== equipo.procesador) 
        changes.push({ label: 'Procesador', old: equipo.procesador || 'N/A', new: data.procesador });
    if (data.ram && data.ram !== equipo.ram) 
        changes.push({ label: 'Memoria RAM', old: equipo.ram || 'N/A', new: data.ram });
    if (data.disco_capacidad && data.disco_capacidad !== equipo.disco_capacidad) 
        changes.push({ label: 'Capacidad Disco', old: equipo.disco_capacidad || 'N/A', new: data.disco_capacidad });
    if (data.disco_tipo && data.disco_tipo !== equipo.disco_tipo) 
        changes.push({ label: 'Tipo Disco', old: equipo.disco_tipo || 'N/A', new: data.disco_tipo });
    if (data.sistema_operativo && data.sistema_operativo !== equipo.sistema_operativo) 
        changes.push({ label: 'S.O.', old: equipo.sistema_operativo || 'N/A', new: data.sistema_operativo });

    const html = `
      <html>
      <head>
        <title>Orden de Servicio Técnico</title>
        <style>
          @page { size: A4 portrait; margin: 1.5cm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0; color: #334155; font-size: 10pt; line-height: 1.4; }
          .header { border-bottom: 2px solid ${brandBlue}; padding-bottom: 10px; margin-bottom: 20px; text-align: center; }
          .title { font-size: 16pt; font-weight: 800; color: ${brandBlue}; text-transform: uppercase; margin: 0; }
          .subtitle { color: ${brandOrange}; font-size: 9pt; font-weight: 600; text-transform: uppercase; }
          
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
          .info-box { border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; background: #f8fafc; }
          .info-label { font-weight: 700; color: ${brandBlue}; font-size: 8pt; text-transform: uppercase; margin-bottom: 3px; display: block; }
          .info-value { font-size: 10pt; color: #1e293b; font-weight: 500; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: ${brandBlue}; color: white; text-align: left; padding: 8px 12px; font-size: 9pt; text-transform: uppercase; }
          td { border: 1px solid #e2e8f0; padding: 8px 12px; font-size: 9pt; vertical-align: top; }
          
          .changes-section { margin-top: 20px; border: 1px solid #dcfce7; background: #f0fdf4; border-radius: 8px; padding: 15px; }
          .changes-title { color: #166534; font-weight: 800; font-size: 10pt; margin-bottom: 10px; text-transform: uppercase; display: flex; align-items: center; gap: 5px; }
          .change-item { display: grid; grid-template-columns: 120px 1fr; margin-bottom: 5px; border-bottom: 1px dashed #bbf7d0; padding-bottom: 3px; }
          .change-label { font-weight: 700; color: #166534; }
          .change-comparison { font-size: 9pt; color: #374151; }
          .old-val { color: #9ca3af; text-decoration: line-through; margin-right: 8px; }
          .new-val { color: #111827; font-weight: 700; }
          
          .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
          .sig-line { border-top: 1px solid #475569; width: 40%; text-align: center; padding-top: 5px; font-weight: 700; font-size: 9pt; color: ${brandBlue}; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Orden de Servicio Técnico</div>
          <div class="subtitle">Gestión de Activos Fijos - Departamento de Tecnología</div>
        </div>

        <div class="info-grid">
           <div class="info-box">
              <span class="info-label">Equipo</span>
              <span class="info-value">${equipo.codigo_activo} - ${equipo.marca} ${equipo.modelo}</span>
           </div>
           <div class="info-box">
              <span class="info-label">Fecha de Trabajo</span>
              <span class="info-value">${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
           </div>
        </div>

        <table>
          <tr>
            <th colspan="2">Resumen del Mantenimiento</th>
          </tr>
          <tr>
            <td style="width: 30%; font-weight: 700;">Tipo de Servicio:</td>
            <td>${data.tipo}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Proveedor / Técnico:</td>
            <td>${data.proveedor}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Costo del Servicio:</td>
            <td>$ ${data.costo.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Descripción Técnica:</td>
            <td>${data.descripcion}</td>
          </tr>
        </table>

        ${changes.length > 0 ? `
          <div class="changes-section">
             <div class="changes-title">Actualización de Especificaciones Técnicas</div>
             ${changes.map(c => `
                <div class="change-item">
                   <span class="change-label">${c.label}:</span>
                   <span class="change-comparison">
                      <span class="old-val">${c.old}</span>
                      <span style="margin-right:8px;">&rarr;</span>
                      <span class="new-val">${c.new}</span>
                   </span>
                </div>
             `).join('')}
          </div>
        ` : ''}

        <div style="margin-top: 30px; font-size: 9pt; text-align: justify; color: #64748b;">
           <strong>Nota:</strong> Se certifica que el equipo ha sido intervenido siguiendo los protocolos de seguridad de la información de la empresa. Los cambios de hardware registrados han sido verificados y actualizados en la base de datos maestra de inventario.
        </div>

        <div class="signatures">
           <div class="sig-line">Firma Técnico / Proveedor</div>
           <div class="sig-line">Responsable IT / Supervisor</div>
        </div>
      </body>
      </html>
    `;
    printCustomHTML(html, 'Orden de Servicio Técnico');
};

export const printCustomHTML = (htmlContent: string, title: string) => {
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) return;
  printWindow.document.write(`<html><head><title>${title}</title></head><body>${htmlContent}<script>window.onload=function(){setTimeout(function(){window.print();},500);}</script></body></html>`);
  printWindow.document.close();
};

export const openPrintPreview = (html: string) => {
    printCustomHTML(html, 'Vista Previa');
};
