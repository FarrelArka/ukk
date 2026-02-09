"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SocialSignUp from "../SocialSignUp";
import Logo from "@/components/Layout/Header/BrandLogo/Logo";
import { useContext, useState } from "react";
import AuthDialogContext from "@/app/context/AuthDialogContext";
import { Toaster } from 'react-hot-toast';
import { Icon } from "@iconify/react"

const SignUp = ({ signUpOpen }: { signUpOpen?: (value: boolean) => void }) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const authDialog = useContext(AuthDialogContext);
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const finalData = { name, email, password };

    fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(finalData),
    })
      .then((res) => res.json())
      .then((data) => {
        toast.success("Successfully registered");
        setLoading(false);
        router.push("/");
      })
      .catch((err) => {
        toast.error(err.message);
        setLoading(false);
      });

    setTimeout(() => {
      signUpOpen?.(false);
    }, 1200);
    authDialog?.setIsUserRegistered(true);

    setTimeout(() => {
      authDialog?.setIsUserRegistered(false);
    }, 1100);
  };

  return (
    <>
      <div className="flex items-center justify-center gap-4 mb-10">
        <Logo />
        <h3 className="text-4xl sm:text-[52px] font-medium tracking-tighter text-black dark:text-white leading-10 sm:leading-[56px]">
          Manembah
        </h3>
      </div>

      <SocialSignUp />

      <span className="z-1 relative my-8 block text-center">
        <span className="-z-1 absolute left-0 top-1/2 block h-px w-full bg-black/10 dark:bg-white/20"></span>
        <span className="text-body-secondary relative z-10 inline-block bg-white px-3 text-base dark:bg-black">
          OR
        </span>
        <Toaster />
      </span>

      <form onSubmit={handleSubmit}>
        <div className="mb-4 sm:mb-[22px]">
          <label
            htmlFor="name"
            className="mb-1 sm:mb-2 block text-sm sm:text-base font-medium text-dark dark:text-white">
            Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Enter your Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="
              w-full
              rounded-xl sm:rounded-2xl
              border border-black/10 dark:border-white/20
              bg-transparent
              px-4 sm:px-5
              py-3
              text-sm sm:text-base
              text-dark dark:text-white
              placeholder:text-gray-400
              outline-none transition
              focus:border-primary
              dark:focus:border-primary
            "
          />
        </div>
        <div className="mb-4 sm:mb-[22px]">
          <label
            htmlFor="email"
            className="mb-1 sm:mb-2 block text-sm sm:text-base font-medium text-dark dark:text-white">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="
              w-full
              rounded-xl sm:rounded-2xl
              border border-black/10 dark:border-white/20
              bg-transparent
              px-4 sm:px-5
              py-3
              text-sm sm:text-base
              text-dark dark:text-white
              placeholder:text-gray-400
              outline-none transition
              focus:border-primary
              dark:focus:border-primary
            "
          />
        </div>
        <div className="mb-6 sm:mb-[22px]">
          <label
            htmlFor="password"
            className="mb-1 sm:mb-2 block text-sm sm:text-base font-medium text-dark dark:text-white"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="
                w-full
                rounded-xl sm:rounded-2xl
                border border-black/10 dark:border-white/20
                bg-transparent
                px-4 sm:px-5
                py-3
                pr-12
                text-sm sm:text-base
                text-dark dark:text-white
                placeholder:text-gray-400
                outline-none transition
                focus:border-primary
                dark:focus:border-primary
              "
            />

            {/* Toggle show / hide */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Icon
                icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                width={20}
              />
            </button>
          </div>
        </div>


        <div className="mb-9">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center rounded-2xl border border-primary bg-primary hover:bg-transparent hover:text-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>
      </form>

      <p className="text-center mb-4 text-base text-body-secondary">
        By creating an account you agree with our{" "}
        <Link href="/" className="text-primary hover:underline">
          Privacy
        </Link>{" "}
        and{" "}
        <Link href="/" className="text-primary hover:underline">
          Policy
        </Link>
      </p>

      <p className="text-body-secondary text-base text-center">
        Already have an account?{" "}
        <Link href="/signin" className="text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </>
  );
};

export default SignUp;
