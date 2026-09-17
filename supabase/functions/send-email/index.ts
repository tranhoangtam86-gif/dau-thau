// Supabase Edge Function: send-email
// Gửi email thông báo (giao việc / hoàn thành) qua Resend API.
//
// YÊU CẦU TRƯỚC KHI DÙNG:
//   1. Đăng ký tài khoản miễn phí tại https://resend.com
//   2. Lấy API Key (Dashboard > API Keys)
//   3. Cài đặt secret cho function:
//      supabase secrets set RESEND_API_KEY=re_xxxxxxxx
//   4. (Khuyến nghị) Xác thực tên miền công ty trong Resend để gửi từ email công ty;
//      nếu chưa xác thực, dùng tạm địa chỉ gửi mặc định "onboarding@resend.dev"
//      (chỉ gửi được tới email đã đăng ký thử nghiệm trong tài khoản Resend).
//
// Triển khai:
//   supabase functions deploy send-email

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const jwt = authHeader.replace('Bearer ', '')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromAddress = Deno.env.get('RESEND_FROM_ADDRESS') || 'onboarding@resend.dev'

    const callerClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user: caller },
    } = await callerClient.auth.getUser(jwt)

    if (!caller) {
      return new Response(JSON.stringify({ error: 'Chưa đăng nhập' }), { status: 401, headers: corsHeaders })
    }

    const { to_user_id, subject, html } = await req.json()
    if (!to_user_id || !subject || !html) {
      return new Response(JSON.stringify({ error: 'Thiếu to_user_id, subject hoặc html' }), { status: 400, headers: corsHeaders })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { data: userRes, error: userErr } = await adminClient.auth.admin.getUserById(to_user_id)
    if (userErr || !userRes?.user?.email) {
      return new Response(JSON.stringify({ error: 'Không tìm thấy email của người nhận' }), { status: 400, headers: corsHeaders })
    }

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'Chưa cấu hình RESEND_API_KEY trên server' }), { status: 500, headers: corsHeaders })
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: userRes.user.email,
        subject,
        html,
      }),
    })

    if (!resendRes.ok) {
      const errText = await resendRes.text()
      return new Response(JSON.stringify({ error: 'Gửi email thất bại: ' + errText }), { status: 400, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
})
