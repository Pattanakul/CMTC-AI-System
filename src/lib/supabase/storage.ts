import { createClient } from './client'
import { v4 as uuidv4 } from 'uuid'

export async function uploadMedia(file: File): Promise<{ url: string; error: string | null }> {
  try {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from('media')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    return { url: publicUrl, error: null }
  } catch (error: any) {
    console.error('Error uploading media:', error.message)
    return { url: '', error: error.message }
  }
}
