const db = require('../models/db');

// Get all lists for user
const getLists = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const lists = await db.query(`
      SELECT 
        fl.*,
        COUNT(fc.id) as card_count
      FROM flashcard_lists fl
      LEFT JOIN flashcard_cards fc ON fl.id = fc.list_id
      WHERE fl.user_id = $1
      GROUP BY fl.id, fl.user_id, fl.title, fl.language, fl.description, fl.created_at, fl.updated_at
      ORDER BY fl.created_at DESC
    `, [userId]);

    res.json(lists.rows);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new list
const createList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, language, description } = req.body;

    if (!title || !language) {
      return res.status(400).json({ error: 'Title and language are required' });
    }

    const result = await db.query(`
      INSERT INTO flashcard_lists (user_id, title, language, description, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `, [userId, title, language, description || '']);

    const newList = await db.query(`
      SELECT 
        fl.*,
        COUNT(fc.id) as card_count
      FROM flashcard_lists fl
      LEFT JOIN flashcard_cards fc ON fl.id = fc.list_id
      WHERE fl.id = $1
      GROUP BY fl.id, fl.user_id, fl.title, fl.language, fl.description, fl.created_at, fl.updated_at
    `, [result.rows[0].id]);

    res.status(201).json(newList.rows[0]);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single list
const getList = async (req, res) => {
  try {
    const userId = req.user.id;
    const listId = req.params.id;

    const list = await db.query(`
      SELECT 
        fl.*,
        COUNT(fc.id) as card_count
      FROM flashcard_lists fl
      LEFT JOIN flashcard_cards fc ON fl.id = fc.list_id
      WHERE fl.id = $1 AND fl.user_id = $2
      GROUP BY fl.id, fl.user_id, fl.title, fl.language, fl.description, fl.created_at, fl.updated_at
    `, [listId, userId]);

    if (list.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.json(list.rows[0]);
  } catch (error) {
    console.error('Error fetching list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update list
const updateList = async (req, res) => {
  try {
    const userId = req.user.id;
    const listId = req.params.id;
    const { title, language, description } = req.body;

    if (!title || !language) {
      return res.status(400).json({ error: 'Title and language are required' });
    }

    await db.query(`
      UPDATE flashcard_lists 
      SET title = $1, language = $2, description = $3, updated_at = NOW()
      WHERE id = $4 AND user_id = $5
    `, [title, language, description || '', listId, userId]);

    const updatedList = await db.query(`
      SELECT 
        fl.*,
        COUNT(fc.id) as card_count
      FROM flashcard_lists fl
      LEFT JOIN flashcard_cards fc ON fl.id = fc.list_id
      WHERE fl.id = $1
      GROUP BY fl.id, fl.user_id, fl.title, fl.language, fl.description, fl.created_at, fl.updated_at
    `, [listId]);

    res.json(updatedList.rows[0]);
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete list
const deleteList = async (req, res) => {
  try {
    const userId = req.user.id;
    const listId = req.params.id;

    await db.query(`
      DELETE FROM flashcard_lists 
      WHERE id = $1 AND user_id = $2
    `, [listId, userId]);

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get cards for a list
const getCards = async (req, res) => {
  try {
    const userId = req.user.id;
    const listId = req.params.listId;

    // Verify user owns the list
    const list = await db.query(`
      SELECT id FROM flashcard_lists 
      WHERE id = $1 AND user_id = $2
    `, [listId, userId]);

    if (list.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    const cards = await db.query(`
      SELECT * FROM flashcard_cards 
      WHERE list_id = $1
      ORDER BY created_at ASC
    `, [listId]);

    res.json(cards.rows);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new card
const createCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const listId = req.params.listId;
    const { word, definition, phonetic, example, note, image } = req.body;

    if (!word || !definition) {
      return res.status(400).json({ error: 'Word and definition are required' });
    }

    // Verify user owns the list
    const list = await db.query(`
      SELECT id FROM flashcard_lists 
      WHERE id = $1 AND user_id = $2
    `, [listId, userId]);

    if (list.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    const result = await db.query(`
      INSERT INTO flashcard_cards (list_id, word, definition, phonetic, example, note, image, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id
    `, [listId, word, definition, phonetic || '', example || '', note || '', image || '']);

    const newCard = await db.query(`
      SELECT * FROM flashcard_cards WHERE id = $1
    `, [result.rows[0].id]);

    res.status(201).json(newCard.rows[0]);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Bulk create cards
const bulkCreateCards = async (req, res) => {
  try {
    const userId = req.user.id;
    const listId = req.params.listId;
    const { cards } = req.body;

    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: 'Cards array is required' });
    }

    // Verify user owns the list
    const list = await db.query(`
      SELECT id FROM flashcard_lists 
      WHERE id = $1 AND user_id = $2
    `, [listId, userId]);

    if (list.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Insert all cards
    const validCards = cards.filter(card => card.word && card.definition);
    
    if (validCards.length === 0) {
      return res.status(400).json({ error: 'No valid cards provided' });
    }

    const insertPromises = validCards.map(card => 
      db.query(`
        INSERT INTO flashcard_cards (list_id, word, definition, phonetic, example, note, image, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `, [
        listId, 
        card.word, 
        card.definition, 
        card.phonetic || '', 
        card.example || card.example1 || '', 
        card.note || '', 
        card.image || ''
      ])
    );

    await Promise.all(insertPromises);

    // Get all cards for the list
    const allCards = await db.query(`
      SELECT * FROM flashcard_cards 
      WHERE list_id = $1
      ORDER BY created_at ASC
    `, [listId]);

    res.status(201).json(allCards.rows);
  } catch (error) {
    console.error('Error bulk creating cards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update card
const updateCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const cardId = req.params.id;
    const { word, definition, phonetic, example, note, image } = req.body;

    if (!word || !definition) {
      return res.status(400).json({ error: 'Word and definition are required' });
    }

    // Verify user owns the card through the list
    const card = await db.query(`
      SELECT fc.* FROM flashcard_cards fc
      JOIN flashcard_lists fl ON fc.list_id = fl.id
      WHERE fc.id = $1 AND fl.user_id = $2
    `, [cardId, userId]);

    if (card.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    await db.query(`
      UPDATE flashcard_cards 
      SET word = $1, definition = $2, phonetic = $3, example = $4, note = $5, image = $6, updated_at = NOW()
      WHERE id = $7
    `, [word, definition, phonetic || '', example || '', note || '', image || '', cardId]);

    const updatedCard = await db.query(`
      SELECT * FROM flashcard_cards WHERE id = $1
    `, [cardId]);

    res.json(updatedCard.rows[0]);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete card
const deleteCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const cardId = req.params.id;

    // Verify user owns the card through the list
    const card = await db.query(`
      SELECT fc.* FROM flashcard_cards fc
      JOIN flashcard_lists fl ON fc.list_id = fl.id
      WHERE fc.id = $1 AND fl.user_id = $2
    `, [cardId, userId]);

    if (card.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    await db.query(`
      DELETE FROM flashcard_cards WHERE id = $1
    `, [cardId]);

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getLists,
  createList,
  getList,
  updateList,
  deleteList,
  getCards,
  createCard,
  bulkCreateCards,
  updateCard,
  deleteCard
};
