import AsyncStorage from "@react-native-async-storage/async-storage"
import { Contagem, Produto } from "."

type KEY = 'LISTA_PRODUTO' | 'LISTA_CONTAGEM'

export class AppStorage {
  static async storeData(key: KEY, value: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, value)
      return true
    } catch (err) {
      return false
    }
  }

  static async listarProdutos(): Promise<Produto[]> {
    try {
      const jsonValue = await AsyncStorage.getItem('LISTA_PRODUTO');
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (err) {
      console.log(err)
      return []
    }

  }

  static async listarContagens(): Promise<Contagem[]> {
    try {
      const jsonValue = await AsyncStorage.getItem('LISTA_CONTAGEM');
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (err) {
      console.log(err)
      return []
    }
  }

}
