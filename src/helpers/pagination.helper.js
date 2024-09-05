// helper for managing pagination in list function

const pagination = function (req) {
  return {
    page: parseInt(req.query.page) || parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1,
    per_page: req.query.per_page ? parseInt(req.query.per_page) : 10,
  };
};

module.exports = pagination;
