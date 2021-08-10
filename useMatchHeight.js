import React from "react";
import { useLocation } from "react-router-dom";
import useBreakpoints from "@/hooks/useBreakpoints";

const defaultOptions = {
  offsetTollerance: 20,
  delayBeforeMatchingHeights: 0,
  userRef: false,
  property: "minHeight",
};

function useMatchHeights(userOptions) {
  const options = { ...defaultOptions, ...userOptions };
  const ref = React.useRef(options.userRef ? options.userRef.current : null);
  const { breakpoint } = useBreakpoints();

  React.useEffect(() => {
    updateMatchedHeights();
    window.addEventListener("resize", updateMatchedHeights);

    return () => {
      resetItems(getItems(ref));
      window.removeEventListener("resize", updateMatchedHeights);
    };
  }, []);

  React.useEffect(() => {
    updateMatchedHeights();
  }, [breakpoint]);

  const getItems = function (ref) {
    if (!ref) return [];
    return Array.from(
      ref && ref.current ? ref.current.querySelectorAll(".matchHeight") : []
    );
  };

  const resetItems = function (items) {
    return items.map((i) => (i.style[options.property] = null));
  };

  const updateMatchedHeights = function () {
    if (!ref || !"current" in ref) return;
    const items = getItems(ref);
    resetItems(items);

    setTimeout(function () {
      items.map((i) => {
        // Calculate the offset with tolerance
        const currentOffset =
          Math.round(i.offsetTop / options.offsetTollerance) *
          options.offsetTollerance;

        // Get items that are at the same parallel
        const matchedElements = items.filter(
          (item) =>
            Math.round(item.offsetTop / options.offsetTollerance) *
              options.offsetTollerance ===
            currentOffset
        );

        // Get the height of the tallest element
        const height = matchedElements.reduce(
          (acc, cur) => (cur.scrollHeight <= acc ? acc : cur.scrollHeight),
          0
        );

        // Update all matched to the same min-height
        matchedElements.map((m) => (m.style[options.property] = `${height}px`));
      });
    }, options.delayBeforeMatchingHeights);
  };

  return {
    ref,
    updateMatchedHeights,
  };
}

export default useMatchHeights;
