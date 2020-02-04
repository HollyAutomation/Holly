import milliseconds = require("ms");

export default (
  time: string | number | null | void,
  defaultTime: number
): number => {
  if (time == null) {
    return defaultTime;
  }
  if (typeof time === "string") {
    const parsedTime = milliseconds(time);
    if (!parsedTime) {
      if (String(parseInt(time)) === time) {
        return parseInt(time);
      }
      throw new Error(
        `Was unable to parse this config option into a time: '${time}'.`
      );
    }
    return parsedTime;
  }
  if (typeof time === "number") {
    return time;
  }
  throw new Error(
    `Received a value that isnt a string or a number for an time option: '${time}', type: ${typeof time}`
  );
};
