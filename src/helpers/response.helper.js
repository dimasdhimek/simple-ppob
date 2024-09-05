// helper for handling response to client

const response = function ({ res, data = null, message, code, status }) {
  let resData = {
    status: status ?? 0,
    message: message ?? 'Sukses',
    data,
  };

  if (code >= 400) {
    if (!message) {
      if (code == 400) {
        resData.message = 'Input tidak valid';
        resData.status = 102;
      } else if (code == 401) {
        resData.message = 'Token tidak tidak valid atau kadaluwarsa';
        resData.status = 108;
      } else if (code == 404) {
        resData.status = 102;
        resData.message = 'Data tidak ditemukan';
      } else if (code == 409) {
        resData.status = 102;
        resData.message = 'Data duplikat';
      } else {
        resData.status = 999;
        resData.message = 'Terjadi kesalahan saat mengolah data';
      }
    }

    if (code <= 599) {
      return res.status(code).json(resData);
    } else {
      return res.status(500).json(resData);
    }
  } else {
    if (code >= 100) {
      return res.status(code).json(resData);
    } else {
      return res.json(resData);
    }
  }
};

module.exports = response;
