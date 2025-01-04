import { useEffect, useState } from "react"
import { Button, Text, View, StyleSheet, TouchableOpacity, TextInput } from "react-native"
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from "react-native-vision-camera"
import { AntDesign } from '@expo/vector-icons'
import * as SQLite from 'expo-sqlite'

export default function App() {
  const device = useCameraDevice('back')
  const { hasPermission, requestPermission } = useCameraPermission()
  const [scan, setScan] = useState(false)
  const [lista, setLista] = useState<{
    codigo: string
    quantidade: number
    produto: string
    id: string
  }[]>([])
  const [edit, setEdit] = useState({
    modal: false,
    codigo: '',
    quantidade: 1,
    produto: '',
  })

  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'ean-8'],
    onCodeScanned: (codes) => {
      setScan(false)
      setEdit({ ...edit, codigo: codes[0].value || '', modal: true })
    }
  })

  const openCam = () => {
    setScan(!scan)
    setEdit({ ...edit, modal: false })
  }

  const renderModalEdicao = () => (
    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', padding: 20 }}>
      <View style={{ backgroundColor: 'white', padding: 20 }}>
        <Text style={{ fontWeight: 'bold', color: 'cyan', marginBottom: 30 }}>NOVA CONTAGEM</Text>
        <Text style={{ marginBottom: 10, color: 'gray' }}>PRODUTO</Text>
        <TextInput style={{ borderBottomWidth: 1, marginBottom: 20 }} value={edit.produto} />]
        <Text style={{ marginBottom: 10, color: 'gray' }}>CÓDIGO DE BARRAS</Text>
        <TextInput style={{ borderBottomWidth: 1, marginBottom: 20 }} value={edit.codigo} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
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
      </View>
    </View>
  )

  const runDB = async () => {
    const db = await SQLite.openDatabaseAsync('DATABASE1');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS produto (id INTEGER PRIMARY KEY, nome TEXT, codigo_barras TEXT, codigo_sistema TEXT);
      CREATE TABLE IF NOT EXISTS contagem (id INTEGER PRIMARY KEY, id_produto INTEGER, quantidade INTEGER, FOREIGN KEY (id_produto) REFERENCES produto (id));
    `);
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