function publicUser(data) {
  return {
    id: 'local',
    email: '',
    name: data.name || 'Гість',
    premiumTier: 'free',
    premiumUntil: null,
  };
}

module.exports = { publicUser };
