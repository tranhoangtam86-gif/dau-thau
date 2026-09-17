// Supabase Edge Function: create-user
// Xử lý 2 hành động cần quyền admin (Service Role Key), không thể làm an toàn từ trình duyệt:
//   action = "create" -> tạo tài khoản đăng nhập mới
//   action = "delete" -> xóa hẳn một tài khoản
//
// Triển khai:
//   supabase functions deploy create-user

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Trình duyệt gửi request 'OPTIONS' để kiểm tra CORS trước khi gửi POST thật
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const jwt = authHeader.replace('Bearer ', '')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const callerClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user: caller },
    } = await callerClient.auth.getUser(jwt)

    if (!caller) {
      return new Response(JSON.stringify({ error: 'Chưa đăng nhập' }), { status: 401, headers: corsHeaders })
    }

    const { data: callerProfile } = await callerClient
      .from('profiles')
      .select('is_admin')
      .eq('id', caller.id)
      .single()

    if (!callerProfile?.is_admin) {
      return new Response(
        JSON.stringify({ error: 'Chỉ admin mới được thực hiện thao tác này' }),
        { status: 403, headers: corsHeaders }
      )
    }

    const body = await req.json()
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    if (body.action === 'create') {
      const { email, password, full_name, is_admin } = body
      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Thiếu email hoặc mật khẩu' }), { status: 400, headers: corsHeaders })
      }

      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      })

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), { status: 400, headers: corsHeaders })
      }

      if (is_admin) {
        await adminClient.from('profiles').update({ is_admin: true }).eq('id', newUser.user.id)
      }

      return new Response(JSON.stringify({ success: true, user: newUser.user }), { status: 200, headers: corsHeaders })
    }

    if (body.action === 'delete') {
      const { user_id } = body
      if (!user_id) {
        return new Response(JSON.stringify({ error: 'Thiếu user_id' }), { status: 400, headers: corsHeaders })
      }
      if (user_id === caller.id) {
        return new Response(JSON.stringify({ error: 'Không thể tự xóa chính mình' }), { status: 400, headers: corsHeaders })
      }

      const { error: deleteError } = await adminClient.auth.admin.deleteUser(user_id)
      if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), { status: 400, headers: corsHeaders })
      }

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })
    }

    if (body.action === 'bulk_create') {
      const { users } = body
      if (!Array.isArray(users) || users.length === 0) {
        return new Response(JSON.stringify({ error: 'Danh sách người dùng trống' }), { status: 400, headers: corsHeaders })
      }

      const results = []
      for (const u of users) {
        const { email, password, full_name, is_admin } = u
        if (!email || !password) {
          results.push({ email: email || '(thiếu email)', success: false, error: 'Thiếu email hoặc mật khẩu' })
          continue
        }
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name },
        })
        if (createError) {
          results.push({ email, success: false, error: createError.message })
          continue
        }
        if (is_admin) {
          await adminClient.from('profiles').update({ is_admin: true }).eq('id', newUser.user.id)
        }
        results.push({ email, success: true, id: newUser.user.id, full_name })
      }

      return new Response(JSON.stringify({ success: true, results }), { status: 200, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ error: 'action không hợp lệ' }), { status: 400, headers: corsHeaders })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
})
