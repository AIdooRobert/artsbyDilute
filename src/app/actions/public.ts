"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  subject: z.string().trim().max(160).optional(),
  message: z.string().trim().min(10).max(5000),
});

export async function sendContactMessage(formData: FormData) {
  const result = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject") || undefined,
    message: formData.get("message"),
  });

  if (!result.success) redirect("/?contact=invalid#contact");
  if (!hasSupabaseEnv()) redirect("/?contact=demo#contact");

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert(result.data);
  redirect(error ? "/?contact=error#contact" : "/?contact=sent#contact");
}
