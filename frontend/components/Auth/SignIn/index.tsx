"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useContext, useState } from "react";
import SocialSignIn from "../SocialSignIn";
import { Toaster } from 'react-hot-toast';
import toast from "react-hot-toast";
import AuthDialogContext from "@/app/context/AuthDialogContext";
import Logo from "@/components/Layout/Header/BrandLogo/Logo";
import { Icon } from "@iconify/react"



const Signin = ({ signInOpen }: { signInOpen?: (value: boolean) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const authDialog = useContext(AuthDialogContext);
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch("/api/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email,
    password,
  }),
});

    if (!res.ok) {
      throw new Error("Login gagal");
    }

    toast.success("Login berhasil!");

    setTimeout(() => {
      window.location.href = "/"; // refresh biar fetch profile
    }, 1000);

  } catch (err) {
    toast.error("Email / password salah");
  } finally {
    setLoading(false);
  }
};
  return (
    <>
    <div className="flex items-center justify-center gap-4 mb-10">
      <Logo />
      <h3 className="text-4xl sm:text-[52px] font-medium tracking-tighter text-black dark:text-white leading-10 sm:leading-[56px]">
        Manembah
      </h3>
    </div>


      <SocialSignIn />

      <span className="z-1 relative my-8 block text-center">
        <span className="-z-1 absolute left-0 top-1/2 block h-px w-full bg-black/10 dark:bg-white/20"></span>
        <span className="text-body-secondary relative z-10 inline-block bg-white px-3 text-base dark:bg-black"
        >
          OR
        </span>
        <Toaster />
      </span>

      <form onSubmit={handleSubmit}>
        <div className="mb-4 sm:mb-[22px]">
          <label
            htmlFor="email"
            className="mb-1 sm:mb-2 block text-sm sm:text-base font-medium text-dark dark:text-white"
            >
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
            className="w-full rounded-xl sm:rounded-2xl border border-black/10 dark:border-white/20 bg-transparent px-4 sm:px-5 py-3 text-sm sm:text-base text-dark dark:text-white placeholder:text-gray-400 outline-none transition focus:border-primary focus-visible:shadow-none dark:focus:border-primary"/>
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
              autoComplete="current-password"
              className="w-full rounded-xl sm:rounded-2xl border border-black/10 dark:border-white/20 bg-transparent px-4 sm:px-5 py-3 pr-12 text-sm sm:text-base text-dark dark:text-white placeholder:text-gray-400 outline-none transition focus:border-primary focus-visible:shadow-none dark:focus:border-primary"/>
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
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </div>
      </form>

      <div className="text-center">
        <Link
          href="/"
          className="mb-2 text-base text-dark hover:text-primary dark:text-white dark:hover:text-primary"
        >
          Forget Password?
        </Link>
      </div>
      <p className="text-body-secondary text-base text-center">
        Not a member yet?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </>
  );
};

export default Signin;