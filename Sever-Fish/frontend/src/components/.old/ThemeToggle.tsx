import React, { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

interface ThemeToggleProps {
    className?: string;
}

function ThemeToggle({ className = "" }: ThemeToggleProps) {
    const [theme, setTheme] = useState<"dark" | "light">(
        localStorage.getItem("theme") === "dark" ? "dark" : "light"
    );

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <SunIcon
                className={`h-5 w-5 transition-colors ${
                    theme === "light" ? "text-yellow-400" : "text-gray-500"
                }`}
            />
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={theme === "dark"}
                    onChange={toggleTheme}
                />
                <div
                    className="w-12 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer transition-colors peer-checked:bg-blue-600"
                ></div>
                <div
                    className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full border border-gray-300 dark:border-gray-500 transition-all peer-checked:translate-x-6"
                ></div>
            </label>
            <MoonIcon
                className={`h-5 w-5 transition-colors ${
                    theme === "dark" ? "text-blue-500" : "text-gray-500"
                }`}
            />
        </div>
    );
}

export default ThemeToggle;
