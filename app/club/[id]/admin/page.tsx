import React from "react";
import { createClient } from "@/lib/supabase/server"

const ClubAdminPage = async ({params}: {params: Promise<{id: string}>}) => {
    const {id} = await params

    const supabase = await createClient()

    const {
    data: { session },
  } = await supabase.auth.getSession()

  if(session) {
    const { data, error } = await supabase
    .from('clubs').select("*").match({
        id,
        "auth_user_id": session.user.id
    })

    console.log(data)
  }

        
    return(
        <p>club id: {id}</p>
    )
}

export default ClubAdminPage