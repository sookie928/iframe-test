
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.(machine).loading:invocation[0]": { type: "done.invoke.(machine).loading:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"xstate.init": { type: "xstate.init" };
"xstate.stop": { type: "xstate.stop" };
        };
        invokeSrcNameMap: {

        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "activateSelectLight": "SELECT.LIGHT";
"addLight": "ADD.LIGHT";
"changeEnv": "CHANGE.ENV";
"clearIOR": "ANIMATION" | "CORRECT" | "DISPOSE" | "END" | "ENV" | "LIGHT" | "LIMIT" | "SHADOW" | "START" | "xstate.stop";
"clearLight": "ANIMATION" | "CORRECT" | "DISPOSE" | "END" | "ENV" | "IOR" | "LIMIT" | "SHADOW" | "START" | "xstate.stop";
"deleteLight": "DELETE.LIGHT";
"getAnimation": "ANIMATION";
"getLight": "ADD.LIGHT" | "DELETE.LIGHT" | "GET.LIGHT";
"initEnv": "ANIMATION" | "CORRECT" | "EDIT" | "ENV" | "IOR" | "LIGHT" | "LIMIT" | "SHADOW" | "done.invoke.(machine).loading:invocation[0]";
"initViewer": "INIT";
"leaveCorrection": "ANIMATION" | "DISPOSE" | "END" | "ENV" | "IOR" | "LIGHT" | "LIMIT" | "SHADOW" | "START" | "xstate.stop";
"moveTarget": "MOVE.CORRECT";
"offViewer": "DISPOSE" | "xstate.stop";
"playAllAnimation": "PLAY.ALL";
"playAnimation": "PLAY.ANIME";
"selectIOR": "SELECT.IOR";
"selectLight": "SELECT.LIGHT";
"setCorrection": "ANIMATION" | "CORRECT" | "EDIT" | "ENV" | "IOR" | "LIGHT" | "LIMIT" | "SHADOW" | "done.invoke.(machine).loading:invocation[0]";
"setData": "START";
"setEnv": "ENV";
"setIOR": "IOR";
"setLight": "LIGHT";
"setLimit": "LIMIT";
"setShadow": "SHADOW";
"toggleModel": "TOGGLE.MODEL";
"transformEnv": "TRANSFORM.ENV";
"transformIOR": "TRANSFORM.IOR";
"transformLight": "TRANSFORM.LIGHT";
"transformLimit": "TRANSFORM.LIMIT";
"transformShadow": "TRANSFORM.SHADOW";
        };
        eventsCausingDelays: {

        };
        eventsCausingGuards: {

        };
        eventsCausingServices: {

        };
        matchesStates: "editing" | "editing.animation" | "editing.correction" | "editing.env" | "editing.ior" | "editing.light" | "editing.limit" | "editing.shadow" | "idle" | "initializing" | "loading" | "off" | "sleep" | { "editing"?: "animation" | "correction" | "env" | "ior" | "light" | "limit" | "shadow"; };
        tags: never;
      }
