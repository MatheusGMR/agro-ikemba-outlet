import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting product images upload...')

    // Mapping of images with their new names and source URLs
    const imagesToUpload = [
      {
        sourceUrl: 'https://c3fd88f5-deed-4c49-874f-a30ae9501862.sandbox.lovable.dev/lovable-uploads/82604c29-155d-49d7-886f-4705ff62c7aa.png',
        fileName: 'venture-max-main.png',
        description: 'Venture Max - Herbicida'
      },
      {
        sourceUrl: 'https://c3fd88f5-deed-4c49-874f-a30ae9501862.sandbox.lovable.dev/lovable-uploads/27f08a0b-b673-4b79-8ff1-45a86ea5a6fe.png',
        fileName: 'ciprian-main.png',
        description: 'Ciprian - Trinexapaque'
      },
      {
        sourceUrl: 'https://c3fd88f5-deed-4c49-874f-a30ae9501862.sandbox.lovable.dev/lovable-uploads/c8f60956-5ffd-4ebc-86f3-8015bdae8ab7.png',
        fileName: 'ciprian-promotional.png',
        description: 'Ciprian - Material Promocional'
      },
      {
        sourceUrl: 'https://c3fd88f5-deed-4c49-874f-a30ae9501862.sandbox.lovable.dev/lovable-uploads/ee2739fa-82b5-4be0-a0ec-030c6a000409.png',
        fileName: 'shift-main.png',
        description: 'Shift - Fomesafem'
      },
      {
        sourceUrl: 'https://c3fd88f5-deed-4c49-874f-a30ae9501862.sandbox.lovable.dev/lovable-uploads/954bcf34-a5c7-43de-9e7b-d8f17234d2e5.png',
        fileName: 'shift-promotional.png',
        description: 'Shift - Material Promocional'
      },
      {
        sourceUrl: 'https://c3fd88f5-deed-4c49-874f-a30ae9501862.sandbox.lovable.dev/lovable-uploads/ca48aa89-f9e0-4382-9772-787e77dd21f9.png',
        fileName: 'entoar-main.png',
        description: 'Entoar - Herbicida'
      }
    ]

    const results = []

    for (const image of imagesToUpload) {
      try {
        console.log(`Downloading ${image.description}...`)
        
        // Fetch the image from the source URL
        const imageResponse = await fetch(image.sourceUrl)
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch ${image.sourceUrl}: ${imageResponse.statusText}`)
        }

        const imageBlob = await imageResponse.arrayBuffer()
        
        console.log(`Uploading ${image.fileName} to Supabase Storage...`)
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(image.fileName, imageBlob, {
            contentType: 'image/png',
            upsert: true
          })

        if (error) {
          console.error(`Error uploading ${image.fileName}:`, error)
          results.push({
            fileName: image.fileName,
            success: false,
            error: error.message
          })
        } else {
          console.log(`Successfully uploaded ${image.fileName}`)
          results.push({
            fileName: image.fileName,
            success: true,
            path: data.path
          })
        }
      } catch (error) {
        console.error(`Error processing ${image.fileName}:`, error)
        results.push({
          fileName: image.fileName,
          success: false,
          error: error.message
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    console.log(`Upload completed: ${successCount}/${totalCount} images uploaded successfully`)

    return new Response(JSON.stringify({
      success: true,
      message: `Upload completed: ${successCount}/${totalCount} images uploaded successfully`,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in upload-product-images function:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})