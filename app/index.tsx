import { Button, Text, View, StyleSheet } from "react-native"
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera"

export default function App() {
  const device = useCameraDevice('back')
  const { hasPermission, requestPermission } = useCameraPermission()

  if (!hasPermission) return <View>
    <Button title="Permitir Acesso a Camera" onPress={requestPermission} />
  </View>

  if (device == null) return <View>
    <Text>Dispositivo não encontrado</Text>
  </View>

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
    />
  )
}
