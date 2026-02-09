import Signin from "@/components/Auth/SignIn";
import { Metadata } from "next";

export const metadata: Metadata = {
    title:
        "Sign In | Manembah",
};

const SigninPage = () => {
    return (
        <>
            <section className="pt-44!">
                <div className="p-4 sm:p-8 md:p-16 container mx-auto max-w-540 py-5 rounded-2xl shadow-auth dark:shadow-dark-auth">
                    <Signin />
                </div>
            </section>
        </>
    );
};

export default SigninPage;
