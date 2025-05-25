"use client";

import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate, useInView } from "framer-motion";
import { useEffect, useState } from "react";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);
  useEffect(() => {
    if (isInView) {
      animate(
        "span",
        {
          display: "inline-block",
          opacity: 1,
          width: "fit-content",
        },
        {
          duration: 0.3,
          delay: stagger(0.1),
          ease: "easeInOut",
        }
      );
    }
  }, [isInView]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <motion.span
                  initial={{}}
                  key={`char-${index}`}
                  className={cn(
                    `dark:text-white text-black opacity-0 hidden`,
                    word.className
                  )}
                >
                  {char}
                </motion.span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </motion.div>
    );
  };
  return (
    <div
      className={cn(
        "text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center",
        className
      )}
    >
      {renderWords()}
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-blue-500",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};

export const TypewriterEffectSmooth = ({
  words,
  text,
  className,
  cursorClassName,
  textClassName,
  cursor = true,
  cursorBlinkSpeed = 0.8,
  minDelay = 30,
  maxDelay = 70,
  onComplete,
}: {
  words?: {
    text: string;
    className?: string;
  }[];
  text?: string;
  className?: string;
  cursorClassName?: string;
  textClassName?: string;
  cursor?: boolean;
  cursorBlinkSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  onComplete?: () => void;
}) => {
  // split text inside of words into array of characters if words are provided
  const wordsArray = words ? words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  }) : [];
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);

  useEffect(() => {
    if (!isInView) return;

    let currentWordIndex = 0;
    let currentCharIndex = 0;
    let timeout: NodeJS.Timeout;
    let continueTyping = true;

    const typingInterval = async () => {
      if (!continueTyping) return;

      // If using words array
      if (words) {
        // If we've reached the end of the current word
        if (currentCharIndex >= wordsArray[currentWordIndex].text.length) {
          currentWordIndex = (currentWordIndex + 1) % wordsArray.length;
          currentCharIndex = 0;

          // Pause at the end of the complete sequence
          if (currentWordIndex === 0) {
            if (onComplete) onComplete();
            continueTyping = false;
            return;
          }
        }

        const delay = Math.random() * (maxDelay - minDelay) + minDelay;
        timeout = setTimeout(typingInterval, delay);

        animate(
          `#word-${currentWordIndex}-char-${currentCharIndex}`,
          { opacity: 1 },
          { duration: 0.1 }
        );

        currentCharIndex++;
      } else if (text) {
        // If using a single text string
        if (currentCharIndex >= text.length) {
          if (onComplete) onComplete();
          continueTyping = false;
          return;
        }

        const delay = Math.random() * (maxDelay - minDelay) + minDelay;
        timeout = setTimeout(typingInterval, delay);

        // Check if the element exists before trying to animate it
        const element = document.getElementById(`char-${currentCharIndex}`);
        if (element) {
          animate(
            element,
            { opacity: 1 },
            { duration: 0.1 }
          );
        }

        currentCharIndex++;
      }
    };

    typingInterval();

    return () => {
      clearTimeout(timeout);
      continueTyping = false;
    };
  }, [isInView, animate, words, text, wordsArray, onComplete, minDelay, maxDelay]);

  const renderWords = () => {
    // Helper function to split text into an array that preserves emojis
    const splitTextWithEmojis = (text: string) => {
      // This regex matches emoji sequences and other characters
      // It handles emojis composed of multiple code points
      return Array.from(text);
    };
    
    if (words) {
      return (
        <div className="inline">
          {wordsArray.map((word, wordIdx) => {
            return (
              <div key={`word-${wordIdx}`} className="inline-block">
                {word.text.map((char, charIdx) => (
                  <span
                    key={`word-${wordIdx}-char-${charIdx}`}
                    id={`word-${wordIdx}-char-${charIdx}`}
                    className={cn(
                      "opacity-0 inline-block dark:text-white text-black",
                      word.className,
                      textClassName
                    )}
                  >
                    {char}
                  </span>
                ))}
                &nbsp;
              </div>
            );
          })}
        </div>
      );
    } else if (text) {
      // Use Array.from to properly split the text, preserving emojis
      const characters = splitTextWithEmojis(text);
      // Calculate how many characters should be visible based on animation progress
      const animateValue = typeof animate === 'number' ? animate : 0;
      const visibleCharacters = Math.floor((text?.length || 0) * animateValue);
      
      return (
        <span className="inline-block whitespace-pre-wrap">
          {characters.map((char, idx) => (
            <span
              key={`char-${idx}`}
              id={`char-${idx}`}
              data-idx={idx}
              className={cn(
                "opacity-0 inline-block", 
                textClassName,
                // Show cursor after the last visible character
                idx === visibleCharacters - 1 && cursor && !isTypingComplete ? "cursor-position" : ""
              )}
            >
              {char}
              {idx === visibleCharacters - 1 && cursor && !isTypingComplete && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: cursorBlinkSpeed,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className={cn(
                    "inline-block rounded-sm w-[3px] h-5 sm:h-6 xl:h-7 bg-blue-500 ml-[1px]",
                    cursorClassName
                  )}
                ></motion.span>
              )}
            </span>
          ))}
        </span>
      );
    }
    return null;
  };

  // State to track if typing is complete
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  // Update the onComplete callback to set typing as complete
  useEffect(() => {
    // Check if we should start the animation
    const animationInProgress = typeof animate === 'number' && animate > 0;
    if (animationInProgress) {
      // Set a timeout to mark typing as complete after animation
      const timeout = setTimeout(() => {
        setIsTypingComplete(true);
        if (onComplete) onComplete();
      }, (text?.length || 0) * (maxDelay + minDelay) / 2 + 500); // Estimate based on text length
      
      return () => clearTimeout(timeout);
    }
  }, [animate, onComplete, text, maxDelay, minDelay]);
  
  // Fix for the conditional check that always returns true
  const shouldShowCursor = cursor && !isTypingComplete;

  // Update cursor position based on animation progress
  useEffect(() => {
    if (text && typeof animate === 'number' && animate > 0) {
      const textLength = text.length;
      const position = Math.min(Math.floor(textLength * animate), textLength);
      setCursorPosition(position);
    }
  }, [text, animate]);

  return (
    <div ref={scope} className={cn("flex items-center", className)}>
      <div className="inline-block relative">
        {renderWords()}
      </div>
    </div>
  );
};
