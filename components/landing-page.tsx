import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Github,
  Linkedin,
  MapPin,
  GraduationCap,
  Twitter,
  BookOpen,
  Code,
  AppWindow,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export function LandingPage({ image }: { image: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-zinc-900 text-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            {image}
            <h1 className="text-3xl font-bold text-white">Jude Gao</h1>
            <div className="text-zinc-300 text-center">
              <p>Web Performance Enthusiast</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/gaojude"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                >
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </Button>
              </Link>
              <Link
                href="https://linkedin.com/in/jude-gao"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                >
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </Button>
              </Link>
              <Link
                href="https://twitter.com/gao_jude"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                >
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-zinc-400" />
              <p className="text-sm text-zinc-300">
                Toronto-based,
                <Link
                  href="https://en.wikipedia.org/wiki/Ningbo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 hover:underline"
                >
                  Ningbo
                </Link>
                -born
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-zinc-400" />
              <p className="text-sm text-zinc-300">
                Computer Science alumnus, University of Waterloo
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-8">
            <div className="relative">
              <div className="absolute left-0 top-0 w-px h-full bg-zinc-700 ml-2.5"></div>
              <div className="relative pl-10">
                <div className="flex items-center mb-4">
                  <div className="absolute left-0 w-5 h-5 bg-blue-500 rounded-full border-4 border-zinc-900"></div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-blue-600 bg-blue-200">
                    2024 - Present
                  </span>
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-white mb-2 flex items-center">
                    <Code className="h-5 w-5 mr-2 text-blue-400" />
                    Engineer at
                    <Link
                      href="https://www.vercel.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 hover:underline"
                    >
                      Vercel
                    </Link>
                  </h3>
                  <p className="text-sm text-zinc-300">Maintaining Next.js</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 w-px h-full bg-zinc-700 ml-2.5"></div>
              <div className="relative pl-10">
                <div className="flex items-center mb-4">
                  <div className="absolute left-0 w-5 h-5 bg-purple-500 rounded-full border-4 border-zinc-900"></div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-purple-600 bg-purple-200">
                    2020 - 2024
                  </span>
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-white mb-2 flex items-center">
                    <Code className="h-5 w-5 mr-2 text-purple-400" />
                    Staff Engineer at{" "}
                    <Link
                      href="https://www.faire.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 hover:underline"
                    >
                      Faire
                    </Link>
                  </h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-start space-x-2">
                      <BookOpen className="h-4 w-4 text-zinc-400 mt-1 flex-shrink-0" />
                      <Link
                        href="https://craft.faire.com/zero-runtime-localization-in-next-js-864e252e387d"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-300 hover:text-white transition-colors"
                      >
                        Zero-Runtime Localization in Next.js
                      </Link>
                    </div>
                    <div className="flex items-start space-x-2">
                      <BookOpen className="h-4 w-4 text-zinc-400 mt-1 flex-shrink-0" />
                      <Link
                        href="https://craft.faire.com/boosting-performance-faires-transition-to-nextjs-3967f092caaf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-300 hover:text-white transition-colors"
                      >
                        Faire&apos;s Transition to Next.js
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-zinc-800">
            <h2 className="text-xl font-semibold text-white mb-4">
              Personal Apps
            </h2>
            <div className="bg-zinc-800/50 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-white mb-2 flex items-center">
                <AppWindow className="h-5 w-5 mr-2 text-green-400" />
                <Link href="/dict" className="hover:underline">
                  𝒻𝒶𝓈𝓉 Dictionary
                </Link>
              </h3>
              <p className="text-sm text-zinc-300">AI-powered dictionary</p>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-lg mt-4">
              <h3 className="text-md font-semibold text-white mb-2 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
                <Link href="/chat" className="hover:underline">
                  𝐹𝒶𝓈𝓉 Chat
                </Link>
              </h3>
              <p className="text-sm text-zinc-300">
                AI chat that auto-selects the best model for your message
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
