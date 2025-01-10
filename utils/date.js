const dayjs = require("dayjs");
require("dayjs/locale/fr");

exports.formatDate = function (dateString) {
  dayjs.locale("fr");
  const date = dayjs(dateString);
  return date.format("dddd DD MMMM YYYY");
};

exports.isBirthday = function (dateString) {
  const date = dayjs(dateString);
  const now = dayjs();

  if (
    date.get("month") === now.get("month") &&
    date.get("date") === now.get("date")
  ) {
    return true;
  }
  return false;
};
