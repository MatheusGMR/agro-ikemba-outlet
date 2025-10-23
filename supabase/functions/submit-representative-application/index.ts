import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { applicationData } = await req.json()

    console.log('=== RECEIVED APPLICATION ===')
    console.log('Email:', applicationData.email)
    console.log('Nome:', applicationData.nome)
    console.log('Possui PJ:', applicationData.possui_pj)
    console.log('CNPJ:', applicationData.cnpj)
    console.log('Status:', applicationData.status)
    console.log('Full data:', JSON.stringify(applicationData, null, 2))

    // Prepare data for insertion
    // IMPORTANT: Mark all new submissions as interest-only since program is inactive
    const insertData = {
      nome: applicationData.nome,
      email: applicationData.email,
      whatsapp: applicationData.whatsapp,
      cidade: applicationData.cidade,
      uf: applicationData.uf,
      linkedin: applicationData.linkedin || null,
      possui_pj: applicationData.possui_pj,
      cnpj: applicationData.cnpj || null,
      razao_social: applicationData.razao_social || null,
      experiencia_anos: applicationData.experiencia_anos,
      segmentos: applicationData.segmentos,
      canais: applicationData.canais,
      regioes: applicationData.regioes,
      conflito_interesse: applicationData.conflito_interesse,
      conflito_detalhe: applicationData.conflito_detalhe || null,
      produtos_lista: applicationData.produtos_lista,
      forecast_data: {}, // Empty object for compatibility
      infra_celular: applicationData.infra_celular,
      infra_internet: applicationData.infra_internet,
      infra_veic_proprio: applicationData.infra_veic_proprio,
      infra_veic_alugado: applicationData.infra_veic_alugado,
      docs_ok: false, // Documents collected later
      doc_urls: [], // Empty array for compatibility
      termos_aceitos: applicationData.termos_aceitos,
      status: 'aguardando',
      // Flag to identify this is an interest manifestation (program inactive)
      motivo_status: 'Manifestação de interesse - Programa temporariamente inativo'
    }

    // Insert into database using service role (bypasses RLS)
    const { data: insertedData, error } = await supabase
      .from('representative_applications')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('=== DATABASE ERROR ===')
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw error
    }

    console.log('Application inserted successfully:', insertedData)

    // Send notification email
    try {
      const { error: emailError } = await supabase.functions.invoke('send-representative-notification', {
        body: {
          application: insertedData,
          type: 'new_application'
        }
      })

      if (emailError) {
        console.error('Email error (non-blocking):', emailError)
      }
    } catch (emailErr) {
      console.error('Email function error (non-blocking):', emailErr)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: insertedData,
        message: 'Application submitted successfully'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})