const { query } = require('./db');

async function list(userId, favorite) {
  if (favorite === undefined) {
    const result = await query(
      'SELECT * FROM user_spreads WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    return result.rows;
  }

  const result = await query(
    'SELECT * FROM user_spreads WHERE user_id = $1 AND favorite = $2 ORDER BY created_at DESC LIMIT 50',
    [userId, favorite]
  );
  return result.rows;
}

async function create(userId, body) {
  const result = await query(
    `INSERT INTO user_spreads (user_id, title, spread_type, cards, interpretation, favorite)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      userId,
      body.title,
      body.spreadType,
      JSON.stringify(body.cards),
      body.interpretation ? JSON.stringify(body.interpretation) : null,
      body.favorite || false,
    ]
  );
  return result.rows[0];
}

async function setFavorite(userId, id, favorite) {
  const result = await query(
    'UPDATE user_spreads SET favorite = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
    [favorite, id, userId]
  );
  if (result.rows.length === 0) {
    const err = new Error('Розклад не знайдено');
    err.statusCode = 404;
    throw err;
  }
  return result.rows[0];
}

async function setNote(userId, id, note) {
  const result = await query(
    'UPDATE user_spreads SET note = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
    [note, id, userId]
  );
  if (result.rows.length === 0) {
    const err = new Error('Розклад не знайдено');
    err.statusCode = 404;
    throw err;
  }
  return result.rows[0];
}

module.exports = { list, create, setFavorite, setNote };
