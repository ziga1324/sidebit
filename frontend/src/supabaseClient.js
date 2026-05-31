import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://cfmareswvjrgrdbzeisp.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmbWFyZXN3dmpyZ3JkYnplaXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY3ODkwNiwiZXhwIjoyMDk0MjU0OTA2fQ.lDNlRik5EyRsup-xR0Lsdqqr1TJxBLK1COY-lBDnjoA"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)