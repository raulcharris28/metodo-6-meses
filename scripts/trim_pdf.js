const { createClient } = require('@supabase/supabase-js');
const { PDFDocument } = require('pdf-lib');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log("1. Descargando manual_assimil.pdf de Supabase...");
    const { data: fileData, error: downloadError } = await supabase.storage.from('INGLES').download('manual_assimil.pdf');
    
    if (downloadError) {
      console.error("Error al descargar el PDF:", downloadError);
      return;
    }

    const arrayBuffer = await fileData.arrayBuffer();
    
    console.log("2. Abriendo el documento PDF para recortarlo...");
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    const pageCount = pdfDoc.getPageCount();
    console.log(`El documento original tiene ${pageCount} paginas.`);
    
    if (pageCount <= 3) {
      console.error("El documento tiene 3 o menos paginas, no se puede recortar.");
      return;
    }

    // Remover páginas 1, 2 y 3 (índices 2, 1, 0 para no alterar el orden mientras borramos)
    console.log("Removiendo las 3 primeras paginas...");
    pdfDoc.removePage(2);
    pdfDoc.removePage(1);
    pdfDoc.removePage(0);
    
    console.log(`El documento nuevo tiene ${pdfDoc.getPageCount()} paginas.`);
    
    console.log("3. Guardando y subiendo el nuevo documento...");
    const pdfBytes = await pdfDoc.save();
    
    const { data: uploadData, error: uploadError } = await supabase.storage.from('INGLES').upload('manual_assimil.pdf', pdfBytes, {
      upsert: true,
      contentType: 'application/pdf'
    });
    
    if (uploadError) {
      console.error("Error al subir el nuevo PDF:", uploadError);
      return;
    }
    
    console.log("Exito! El manual_assimil.pdf fue recortado y subido correctamente.");
    console.log(uploadData);
  } catch (error) {
    console.error("Error general:", error);
  }
}

main();
