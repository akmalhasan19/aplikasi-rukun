export type language = 'en' | 'id';

export type Dictionary = {
    login: string;
}

export const kamus: Record<language, Dictionary> = {
    en: {
        login: "Login"
    },
    id: {
        login: "Masuk di sini"
    }
}