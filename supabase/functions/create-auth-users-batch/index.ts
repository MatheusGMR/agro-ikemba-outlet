import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreateAuthUsersRequest {
  userIds?: string[];
  createAll?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incompleta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { userIds, createAll }: CreateAuthUsersRequest = await req.json();

    // Get users to create auth accounts for
    let query = supabaseAdmin
      .from('users')
      .select('id, name, email, phone')
      .eq('status', 'approved');

    if (!createAll && userIds && userIds.length > 0) {
      query = query.in('id', userIds);
    }

    const { data: users, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar usuários' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhum usuário encontrado para criar contas de autenticação' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: any[] = [];

    for (const user of users) {
      try {
        // Generate a temporary password
        const tempPassword = generateTempPassword();

        // Create auth user
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            name: user.name || user.email.split('@')[0],
            phone: user.phone
          }
        });

        if (authError) {
          console.error(`Error creating auth user for ${user.email}:`, authError);
          
          if (authError.message?.includes('already been registered')) {
            // User already exists, send password recovery email instead
            try {
              const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email: user.email,
              });

              if (resetError) throw resetError;

              // Send recovery email
              await supabaseAdmin.functions.invoke('send-auth-email', {
                body: {
                  email: user.email,
                  type: 'recovery',
                  name: user.name,
                  token: resetData.properties?.action_link
                }
              });

              results.push({
                user_id: user.id,
                email: user.email,
                status: 'recovery_sent',
                message: 'Usuário já existia - link de recuperação enviado'
              });
            } catch (recoveryError) {
              console.error(`Error sending recovery for ${user.email}:`, recoveryError);
              results.push({
                user_id: user.id,
                email: user.email,
                status: 'already_exists',
                message: 'Usuário já possui conta de autenticação'
              });
            }
          } else {
            results.push({
              user_id: user.id,
              email: user.email,
              status: 'error',
              error: authError.message
            });
          }
          continue;
        }

        // Send credentials email
        try {
          await supabaseAdmin.functions.invoke('send-auth-email', {
            body: {
              email: user.email,
              type: 'auth_created',
              name: user.name,
              password: tempPassword
            }
          });

          results.push({
            user_id: user.id,
            email: user.email,
            auth_id: authUser.user?.id,
            status: 'created',
            message: 'Conta criada e credenciais enviadas por email',
            temp_password: tempPassword
          });
        } catch (emailError) {
          console.error(`Error sending email to ${user.email}:`, emailError);
          results.push({
            user_id: user.id,
            email: user.email,
            auth_id: authUser.user?.id,
            status: 'created_no_email',
            message: 'Conta criada mas erro ao enviar email',
            temp_password: tempPassword
          });
        }

      } catch (error: any) {
        console.error(`Error processing user ${user.email}:`, error);
        results.push({
          user_id: user.id,
          email: user.email,
          status: 'error',
          error: error.message
        });
      }
    }

    const summary = {
      total: results.length,
      created: results.filter(r => r.status === 'created').length,
      already_exists: results.filter(r => r.status === 'already_exists').length,
      recovery_sent: results.filter(r => r.status === 'recovery_sent').length,
      errors: results.filter(r => r.status === 'error').length,
      created_no_email: results.filter(r => r.status === 'created_no_email').length
    };

    console.log('Batch auth user creation completed:', summary);

    return new Response(
      JSON.stringify({ 
        success: true,
        summary,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

serve(handler);