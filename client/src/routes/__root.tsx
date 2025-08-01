import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { createContext, useEffect, useState } from "react";
import { MdOutlineDarkMode } from "react-icons/md";
import { MdDarkMode } from "react-icons/md";
import { useMediaQuery } from "react-responsive";
import { GiHamburgerMenu } from "react-icons/gi";
import { CgCloseO } from "react-icons/cg";

//import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const colors_light = {
  background: "#F2E9E4",
  accent: "#C9ADA7",
  text: "#22223B",
  primary: "#9A8C98",
  secondary: "#C9ADA7",
  heapmapBackground: "#2e2e4b",
  heatmap: {
    0: "#dcd6d0",
    1: "#cbbfb7",
    4: "#a99890",
    8: "#a48b81",
    10: "#5e4b44",
  },
};
const colors_dark = {
  background: "#22223B",
  accent: "#C9ADA7",
  text: "#F2E9E4",
  primary: "#4A4E69",
  secondary: "#9A8C98",
  heapmapBackground: "#2e2e4b",
  heatmap: {
    0: "#3a3a5c",
    1: "#66667a",
    4: "#9999aa",
    8: "#cccccc",
    10: "#ffffff",
  },
};

const init_theme: {
  vals: {
    theme: "light" | "dark";
    mobile: boolean;
    colors: typeof colors_dark;
  };
  toggleTheme: () => void;
  toggleMobile: () => void;
} = {
  vals: {
    theme: "light",
    mobile: false,
    colors: colors_dark,
  },
  toggleTheme: () => {},
  toggleMobile: () => {},
};

export const ThemeContext = createContext(init_theme);

//context
export const Route = createRootRoute({
  component: () => {
    const isBigScreen = useMediaQuery({ query: "(min-width: 1824px)" });
    const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });
    const [toggleDropDown, setToggleDropDown] = useState(false);
    useEffect(() => {
      setToggleDropDown(false);
    }, [isTabletOrMobile]);

    const [theme, setTheme] = useState<{
      theme: "light" | "dark";
      mobile: boolean;
      colors: typeof colors_dark;
    }>({
      theme: "dark",
      mobile: false,
      colors: colors_dark,
    });
    useEffect(() => {
      let x = localStorage.getItem("theme");
      if (x && x === "light") {
        setTheme({
          ...theme,
          theme: "light",
          mobile: false,
          colors: colors_light,
        });
      } else {
        setTheme({
          ...theme,
          theme: "dark",
          mobile: false,
          colors: colors_dark,
        });
      }
    }, []);

    const toggleTheme = () => {
      console.log(theme.theme);
      if (theme.theme === "light") {
        setTheme({ ...theme, theme: "dark", colors: colors_dark });
        localStorage.setItem("theme", "dark");
      } else {
        setTheme({ ...theme, theme: "light", colors: colors_light });
        localStorage.setItem("theme", "light");
      }
    };
    const toggleMobile = () => {
      setTheme({ ...theme, mobile: !theme.mobile });
    };

    const linkStyle: React.CSSProperties = {
      textDecoration: "none",
      color: theme.colors.text,
      fontSize: 20,
    };
    const menuLinks = (
      <>
        <Link
          to="/"
          style={{ ...linkStyle, fontSize: 14 }}
          onClick={() => setToggleDropDown(false)}
        >
          HOME
        </Link>
        <Link
          to="/arrays"
          style={{ ...linkStyle, fontSize: 14 }}
          onClick={() => setToggleDropDown(false)}
        >
          ARRAYS
        </Link>
      </>
    );
    return (
      <div
        style={{
          backgroundColor: theme.colors.background,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          textDecoration: "none",
          color: theme.colors.text,
          fontSize: 18,
        }}
      >
        <ThemeContext.Provider
          value={{ vals: theme, toggleTheme, toggleMobile }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              color: theme.colors.text,
              justifyContent: isBigScreen ? "center" : "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${theme.colors.text}`,
              padding: 30,
              paddingLeft: 60,
              paddingRight: 60,
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                maxWidth: 1824,
                flexDirection: "row",
                color: theme.colors.text,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  width: isTabletOrMobile ? "100%" : "min-content",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {isTabletOrMobile && (
                  <div
                    style={{ width: "min-content", cursor: "pointer" }}
                    onClick={() => {
                      setToggleDropDown(!toggleDropDown);
                    }}
                  >
                    {!toggleDropDown ? (
                      <GiHamburgerMenu />
                    ) : (
                      <CgCloseO size={20} />
                    )}
                  </div>
                )}

                <Link
                  to="/"
                  style={{
                    ...linkStyle,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  BusyTutor
                </Link>
              </div>

              {!isTabletOrMobile && (
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    justifyContent: "center",
                    columnGap: 20,
                    width: "max-content",
                    textDecoration: "underline",
                    textUnderlineOffset: 4,
                  }}
                >
                  {menuLinks}
                </div>
              )}
              <div
                onClick={() => {
                  toggleTheme();
                }}
                style={{ cursor: "pointer", width: "min-content" }}
              >
                {theme.theme === "dark" ? (
                  <MdDarkMode size={30} />
                ) : (
                  <MdOutlineDarkMode size={30} />
                )}
              </div>
            </div>
          </div>

          {isTabletOrMobile && toggleDropDown && (
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: theme.colors.background,
                  rowGap: 20,
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  left: 0,
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                {menuLinks}
              </div>
            </div>
          )}

          <div
            style={{
              height: "100%",
              width: "100%",
              flexDirection: "column",
              display: "flex",
              flex: "1 1 auto",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                height: "100%",
                flexDirection: "column",
                maxWidth: 1824,
                flex: "1 1 auto",
                width: isTabletOrMobile ? "100%" : "100%",
              }}
            >
              <Outlet />
            </div>
          </div>
        </ThemeContext.Provider>
      </div>
    );
  },
});
