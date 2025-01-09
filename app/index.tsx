import { useEffect, useState } from "react"
import { Button, Text, View, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native"
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from "react-native-vision-camera"
import { AntDesign } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppStorage } from "./storage"

export interface Produto {
  id: number
  nome: string
  codigo_sistema: string
  codigo_barras: string
}

export interface Contagem extends Produto {
  id: number
  quantidade: number
}

export default function App() {
  const device = useCameraDevice('back')
  const { hasPermission, requestPermission } = useCameraPermission()
  const [scan, setScan] = useState(false)

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [contagens, setContagens] = useState<Contagem[]>([])
  const [edit, setEdit] = useState({
    modal: false,
    id: 0,
    codigo_barras: '',
    codigo_sistema: '',
    quantidade: 1,
    nome: '',
  })

  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'ean-8'],
    onCodeScanned: (codes) => {
      setScan(false)
      setEdit({ ...edit, codigo_barras: codes[0].value || '', modal: true })
    }
  })

  const openCam = () => {
    setScan(!scan)
    setEdit({ ...edit, modal: false })
  }

  const salvarEdicao = async () => {
    if (edit.id < 1) {
      const c = [...contagens, { ...edit, id: contagens.length + 1 }]
      setContagens(c)
      setEdit({ modal: false, id: 0, codigo_barras: '', codigo_sistema: '', quantidade: 1, nome: '' })
      await AppStorage.storeData('LISTA_CONTAGEM', JSON.stringify(c))
      return
    }

    const index = contagens.findIndex(e => e.id === edit.id)
    const c = [...contagens]
    c[index].quantidade += edit.quantidade
    c[index].nome = edit.nome
    await AppStorage.storeData('LISTA_CONTAGEM', JSON.stringify(c))
    setContagens(c)
  }

  const renderModalEdicao = () => (
    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', padding: 20 }}>
      <View style={{ backgroundColor: 'white', padding: 20 }}>
        <Text style={{ fontWeight: 'bold', color: 'cyan', marginBottom: 30 }}>NOVA CONTAGEM</Text>
        <Text style={{ marginBottom: 10, color: 'gray' }}>PRODUTO</Text>
        <TextInput style={{ borderBottomWidth: 1, marginBottom: 20 }} value={edit.nome} onChangeText={e => setEdit({ ...edit, nome: e })} />]
        <Text style={{ marginBottom: 10, color: 'gray' }}>CÓDIGO DE BARRAS</Text>
        <TextInput style={{ borderBottomWidth: 1, marginBottom: 20 }} value={edit.codigo_barras} onChangeText={e => setEdit({ ...edit, codigo_barras: e })} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={{ color: 'gray' }}>QUANTIDADE</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={styles.qtdButton} onPress={() => setEdit({ ...edit, quantidade: edit.quantidade - 1 })}>
              <AntDesign color="white" name="minus" size={26} />
            </TouchableOpacity>
            <Text style={{ paddingHorizontal: 10 }}>{edit.quantidade}</Text>
            <TouchableOpacity style={styles.qtdButton} onPress={() => setEdit({ ...edit, quantidade: edit.quantidade + 1 })}>
              <AntDesign color="white" name="plus" size={26} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <View style={{ width: '30%' }}>
            <Button title="SALVAR" onPress={salvarEdicao} />
          </View>
        </View>
      </View>
    </View>
  )

  const renderListas = () => (
    <View>
      <View>
        
      </View>
      <FlatList
        data={contagens}
        keyExtractor={e => e.id.toString()}
        renderItem={({ item }) => (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: '#ccc',
            marginBottom: 10,
            padding: 10,
          }}>
            <View style={{ flexDirection: 'column' }}>
              <Text>{item.codigo_barras}</Text>
              <Text>{item.nome}</Text>
            </View>
            <Text>{item.quantidade}</Text>
          </View>
        )}
      />
    </View>
  )

  useEffect(() => {
    if (!edit.codigo_barras) return
    const search = produtos.filter(e => e.codigo_barras === edit.codigo_barras)
    if (search.length) setEdit({
      ...edit,
      nome: search[0].nome, codigo_sistema: search[0].codigo_sistema, id: search[0].id
    })
  }, [edit.codigo_barras])

  const runDB = async () => {
    setProdutos(await AppStorage.listarProdutos())
    setContagens(await AppStorage.listarContagens())
  }

  useEffect(() => { runDB() }, [])

  if (!hasPermission) return <View>
    <Button title="Permitir Acesso a Camera" onPress={requestPermission} />
  </View>

  if (device == null) return <View>
    <Text>Dispositivo não encontrado</Text>
  </View>

  return (
    <View style={{ flex: 1 }}>
      {scan && <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />}
      <View style={{ backgroundColor: 'tomato', position: 'absolute', bottom: 20, right: 20, borderRadius: 10 }}>
        <TouchableOpacity onPress={openCam}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 40, paddingHorizontal: 20 }}>{scan ? '-' : '+'}</Text>
        </TouchableOpacity>
      </View>
      {!scan && renderListas()}
      {edit.modal && renderModalEdicao()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {

  },
  qtdButton: {
    backgroundColor: 'cyan',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderRadius: 5
  }
})
