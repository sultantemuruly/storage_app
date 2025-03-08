import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black py-3 px-8 text-center fixed bottom-0 w-full">
      <p className="text-white text-sm">
        Created by{" "}
        <a
          href="https://github.com/sultantemuruly"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          @sultantemuruly
        </a>
      </p>
    </footer>
  );
};

export default Footer;
