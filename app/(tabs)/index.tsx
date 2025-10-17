import MyTestModule from 'my-test-module';
import { useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testHello = () => {
    const message = MyTestModule.hello();
    setResult(`Hello: ${message}`);
  };

  const testDeviceInfo = () => {
    const info = MyTestModule.getDeviceInfo();
    setResult(JSON.stringify(info, null, 2));
  };

  const testVibrate = () => {
    const message = MyTestModule.vibrate(500);
    setResult(message);
  };

  const testAgeSignals = async () => {
    try {
      setLoading(true);
      setResult('Fetching age signals from Google Play...');
      
      // Log what functions are available
      console.log('Available functions:', Object.keys(MyTestModule));
      
      // Try calling it
      const ageData = await MyTestModule.getAgeSignals();
      setResult(JSON.stringify(ageData, null, 2));
    } catch (error: any) {
      console.log('Full error:', error);
      setResult(`Error: ${error.message || error}\n\n${error.stack || ''}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Test Android Module</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Hello" onPress={testHello} />
        <Button title="Get Device Info" onPress={testDeviceInfo} />
        <Button title="Vibrate" onPress={testVibrate} />
        <Button 
          title="Get Age Signals (Beta)" 
          onPress={testAgeSignals} 
          disabled={loading}
        />
      </View>
      
      {loading && <ActivityIndicator size="large" style={styles.loader} />}
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Result:</Text>
        <Text style={styles.result}>{result}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 10,
    width: '100%',
  },
  loader: {
    marginTop: 20,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '100%',
  },
  resultLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  result: {
    fontFamily: 'monospace',
  },
});