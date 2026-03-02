// ============================================
// NixBoard API Module
// ============================================

const createApi = (loading) => {
  /**
   * Generic API fetch wrapper
   * @param {string} path - API endpoint path
   * @param {object} options - Fetch options (method, body, headers)
   * @returns {Promise<object>} - JSON response
   */
  const api = async (path, options = {}) => {
    loading.value = true;
    try {
      const r = await fetch(path, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
      });
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } catch (e) {
      console.error('API Error:', e);
      alert('Failed to connect. Please try again.');
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load board data from API
   * @param {Function} onLoad - Callback after successful load
   */
  const loadBoard = async (onLoad) => {
    const data = await api(API.boardEndpoint);
    if (onLoad) onLoad(data);
  };

  /**
   * Generate a new card code
   * @returns {Promise<string>} - New code
   */
  const generateCode = async () => {
    const data = await api(API.codeEndpoint);
    return data.code;
  };

  /**
   * Update a card
   * @param {number} cardId - Card ID
   * @param {object} updates - Fields to update
   */
  const updateCard = async (cardId, updates) => {
    return await api(`/api/cards/${cardId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  };

  /**
   * Create a new card
   * @param {object} cardData - Card data
   */
  const createCard = async (cardData) => {
    return await api('/api/cards', {
      method: 'POST',
      body: JSON.stringify(cardData)
    });
  };

  /**
   * Delete a card
   * @param {number} cardId - Card ID
   */
  const deleteCard = async (cardId) => {
    return await api(`/api/cards/${cardId}`, {
      method: 'DELETE'
    });
  };

  /**
   * Create a subtask
   * @param {number} cardId - Card ID
   * @param {string} title - Subtask title
   */
  const createSubtask = async (cardId, title) => {
    return await api(`/api/cards/${cardId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ title })
    });
  };

  /**
   * Update a subtask
   * @param {number} subtaskId - Subtask ID
   * @param {object} updates - Fields to update
   */
  const updateSubtask = async (subtaskId, updates) => {
    return await api(`/api/subtasks/${subtaskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  };

  /**
   * Delete a subtask
   * @param {number} subtaskId - Subtask ID
   */
  const deleteSubtask = async (subtaskId) => {
    return await api(`/api/subtasks/${subtaskId}`, {
      method: 'DELETE'
    });
  };

  return {
    api,
    loadBoard,
    generateCode,
    updateCard,
    createCard,
    deleteCard,
    createSubtask,
    updateSubtask,
    deleteSubtask,
  };
};

// Export for use in other files
if (typeof window !== 'undefined') {
  window.NIXBOARD_API = { createApi };
}
