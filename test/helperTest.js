const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');

const users = {
  OI9M: {
    id: 'OI9M',
    email: 'anogwihvictor@gmail.com',
    password: '$2a$10$Oa5evBTgDYqRcoJ2roKRiOKTUHcRSXBSBd55XBUY2AUexF0/e6Uca'
  },
  '2Wik': {
    id: '2Wik',
    email: 'zarvichosh@gmail.com',
    password: '$2a$10$lt0hPNObPA3u1plB5zRbpeRuKpJP.s5lj72tZzMTHDRzCWsxRsBTe'
  }

}

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@anogwihvictor.com", users);
    const expectedUserID = "OI9M";
    assert.equal(users.id, expectedUserID);
  });

  it('should return null for an invalid email', function () {
    const user = getUserByEmail("nonexistent@example.com", users);
    assert.isNull(user);
  });

});