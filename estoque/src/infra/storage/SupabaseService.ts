import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""

let client: ReturnType<typeof createClient> | null = null

function getClient() {
  if (!client) {
    client = createClient(supabaseUrl, supabaseKey)
  }
  return client
}

export const SupabaseStorage = {
  async upload(
    bucket: string,
    file: Buffer,
    contentType: string,
    fileName?: string
  ): Promise<string> {
    const ext = contentType.split("/")[1] || "jpg"
    const path = `${uuidv4()}.${ext}`

    const { error } = await getClient()
      .storage
      .from(bucket)
      .upload(path, file, { contentType, upsert: false })

    if (error) throw new Error(`Erro ao fazer upload: ${error.message}`)

    const { data: { publicUrl } } = getClient()
      .storage
      .from(bucket)
      .getPublicUrl(path)

    return publicUrl
  },
}
