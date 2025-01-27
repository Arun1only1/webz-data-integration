interface ResponseMessages {
  API_HIT_ERROR: string;
  DATA_FETCH_ERROR: string;
  NEWS_FETCHED_SUCCESSFULLY: string;
  SUCCESS: string;
  UNEXPECTED_API_DATA_FORMAT: string;
  WEB_HOSE_API_KEY_NOT_FOUND: string;
  TRANSACTION_FAILED: string;
}

const responseMessages: { [key: string]: ResponseMessages } = {
  FR: {
    SUCCESS: 'succès',
    NEWS_FETCHED_SUCCESSFULLY:
      'Les nouvelles ont été récupérées et enregistrées avec succès.',
    WEB_HOSE_API_KEY_NOT_FOUND: 'Clé API Web Hose introuvable.',
    API_HIT_ERROR: "Échec de l'appel à l'API Web hose.",
    DATA_FETCH_ERROR: 'Erreur de récupération des données.',
    UNEXPECTED_API_DATA_FORMAT: 'Format de réponse API inattendu.',
    TRANSACTION_FAILED:
      'Échec de la transaction. Annulation des modifications.',
  },
  EN: {
    API_HIT_ERROR: 'Web hose api hit failed.',
    DATA_FETCH_ERROR: 'Error fetching data.',
    NEWS_FETCHED_SUCCESSFULLY: 'News fetched and saved successfully.',
    SUCCESS: 'success',
    UNEXPECTED_API_DATA_FORMAT: 'Unexpected API response format.',
    WEB_HOSE_API_KEY_NOT_FOUND: 'Web hose api key not found.',
    TRANSACTION_FAILED: 'Transaction failed. Rolling back changes.',
  },
};

const systemLanguage = process.env.SYSTEM_LANGUAGE || 'EN';

const Lang: ResponseMessages =
  systemLanguage === 'EN' ? responseMessages.EN : responseMessages.FR;

export default Lang;
