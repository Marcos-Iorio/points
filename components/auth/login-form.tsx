"use client"

import { createClient } from "@/lib/supabase/client"

const LoginForm = () => {
      const supabase = createClient()

    return(
        <>
            <p>Login Form</p>
        </>
    );
}

export default LoginForm;