"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/server";

export async function studentSignUp(formData: FormData) {
    const supabase = await createClient();

    //👇🏻 Extract form data
    const credentials = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        interest: formData.get("interest") as string,
        name: formData.get("name") as string,
    };

    //👇🏻 Supabase sign up function (options attribute :- for user metadata)
    const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
            data: {
                interest: credentials.interest,
                name: credentials.name,
            },
        },
    });

    //👉🏻 return user or error object
     if (error) {
        return { error: error.message, status: error.status, user: null };
    } else if (data.user?.identities?.length === 0) {
        return { error: "User already exists", status: 409, user: null };
    }

    revalidatePath("/", "layout");
    return { error: null, status: 200, user: data.user };
}