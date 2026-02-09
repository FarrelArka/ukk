import SignUp from "@/components/Auth/SignUp";
import { Metadata } from "next";

export const metadata: Metadata = {
    title:
        "Sign Up | Manembah",
};

const SignUpPage = () => {
    return (
        <>
            <section className="min-h-screen flex items-start justify-center pt-44 px-4">
                <div className="w-full max-w-[540px] p-4 sm:p-8 md:p-16 rounded-2xl shadow-auth dark:shadow-dark-auth">
                    <SignUp />
                </div>
            </section>
        </>
    );
};

export default SignUpPage;
