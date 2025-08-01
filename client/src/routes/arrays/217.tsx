import { createFileRoute } from "@tanstack/react-router";
import { useContext, useState } from "react";
import { ThemeContext } from "../__root";
import { VscDebugStart } from "react-icons/vsc";
import { VscDebugStepOver } from "react-icons/vsc";
import { testInterperter } from "../../utils/interperter";

export const Route = createFileRoute("/arrays/217")({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    vals: { colors },
  } = useContext(ThemeContext);
  const [toggleGame, setToggleGame] = useState(false);
  //    const [nums, setNums] = useState<number[] | null>([]);
  //   const [variables, setVariables] = useState<{ name: string, type: 'val' | 'ref', tooltip: string }[]>([]);
  //

  return (
    <div
      style={{
        width: "100%",
        display: "flex",

        height: "100%",
      }}
    >
      <div
        style={{
          width: "50%",
          borderRight: `1px solid ${colors.text}`,
          padding: !toggleGame ? 20 : 0,
          rowGap: !toggleGame ? 40 : 0,
          paddingTop: !toggleGame ? 40 : 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            transform: toggleGame ? "translateX(-50%)" : "translateX(0)",
            transition:
              " visibility 0, opacity 0.5s ease-out, transform 0.5s ease-out",
            visibility: toggleGame ? "hidden" : "visible",
            opacity: toggleGame ? 0 : 1,
            display: toggleGame ? "none" : "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: 40,
            }}
          >
            217. Contains Duplicate
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              rowGap: 20,
            }}
          >
            <p>
              Given an integer array nums, return true if any value appears at
              least twice in the array, and return false if every element is
              distinct.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: 10,
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                }}
              >
                Constraints
              </div>
              <ul
                style={{
                  display: "flex",
                  flexDirection: "column",
                  rowGap: 10,
                  paddingLeft: 40,
                  listStyle: "disc",
                }}
              >
                <li>${"1 <= nums.length <= 105"}</li>
                <li>{"-109 <= nums[i] <= 109"}</li>
              </ul>
            </div>
          </div>

          <div
            style={{
              rowGap: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: 20,
              }}
            >
              Ideas
            </div>
            <div
              style={{
                backgroundColor: colors.secondary,
                borderRadius: 5,
              }}
            >
              <ul>
                <li
                  style={{
                    width: 50,
                    backgroundColor: colors.primary,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  1
                </li>
              </ul>
            </div>
            <div
              style={{
                display: "flex",
                rowGap: 10,
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: 17,
                }}
              >
                Brute Force
              </div>
              <div>
                We can loop through the arrays 2 and compare each element with
                each to each other. If we find a match we return false else we
                return true
              </div>
              <div
                style={{
                  display: "flex",
                }}
              >
                <div
                  style={{
                    width: 200,
                  }}
                >
                  Time Complexity
                </div>
                <div>O(N^2)</div>
              </div>

              <div
                style={{
                  display: "flex",
                }}
              >
                <div
                  style={{
                    width: 200,
                  }}
                >
                  Space Complexity
                </div>
                <div>O(1)</div>
              </div>
            </div>
          </div>

          <div
            style={{
              rowGap: 20,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: 20,
              }}
            >
              Tests
            </div>

            <div
              onClick={() => {}}
              style={{
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  columnGap: 20,
                }}
              >
                <VscDebugStart
                  onClick={() => {
                    setToggleGame((toggleGame) => !toggleGame);
                    //setNums([1, 2, 3, 4, 4])
                  }}
                  style={{
                    cursor: "pointer",
                  }}
                />
                <div>
                  <b style={{ fontWeight: "bold" }}>Nums:</b> [1, 2, 3, 4, 4]
                  Result: True
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        id={"viewport"}
        style={{
          width: "50%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          onClick={async () => {
            testInterperter();
          }}
        >
          <VscDebugStepOver />
          {arrayVisual({ arg: [{ 1: 2 }], name: "hello", colors })}
        </div>
      </div>
    </div>
  );
}

const arrayVisual = ({ arg, colors }: any) => {
  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <div
        style={{
          borderLeft: "1px solid black",
          borderTop: "1px solid black",
          borderBottom: "1px solid black",
          width: 10,
        }}
      ></div>
      {arg.map((n: any, idx: any) => (
        <div
          key={`array-${n}`}
          style={{
            display: "flex",
          }}
        >
          <div
            style={{
              padding: 10,
              borderRight: `${idx === arg.length - 1 ? 0 : 1}px solid black`,
            }}
          >
            {typeof n === "object" ? ref({ key: n, name: "obj", colors }) : n}
          </div>
        </div>
      ))}

      <div
        style={{
          borderRight: "1px solid black",
          borderTop: "1px solid black",
          borderBottom: "1px solid black",
          width: 10,
        }}
      ></div>
    </div>
  );
};

const ref = ({ key, name, colors }: any) => (
  <div key={key + name}>
    <div
      style={{
        width: 30,
        backgroundColor: colors.secondary,
        borderTop: `2px solid ${colors.primary}`,
        borderLeft: `2px solid ${colors.primary}`,
        borderRight: `2px solid ${colors.primary}`,
        height: 20,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: 12,
      }}
    >
      {`=>`}
    </div>
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.secondary,
        width: 30,
        fontSize: 10,
        border: `2px solid ${colors.primary}`,
        height: 30,
      }}
    >
      {name}
    </div>
  </div>
);

const box = ({ key, name, colors }: any) => (
  <div
    key={key + name}
    style={{
      transition: "position(50px, 50px) 2s, position(0px, 0px) 2s",
    }}
  >
    <div
      style={{
        width: 30,
        backgroundColor: colors.secondary,
        borderTop: `2px solid ${colors.primary}`,
        borderLeft: `2px solid ${colors.primary}`,
        borderRight: `2px solid ${colors.primary}`,
        height: 20,
      }}
    ></div>
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.secondary,
        width: 30,
        border: `2px solid ${colors.primary}`,
        height: 30,
      }}
    >
      {name}
    </div>
  </div>
);
