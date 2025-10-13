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

  const testAgeSignals = async () => {
    try {
      setLoading(true);
      setResult('Fetching age signals...');
      
      // Check if available first
      const isAvailable = MyTestModule.isAgeSignalsAvailable();
      
      if (!isAvailable) {
        setResult('Age Signals API is not available on this device');
        setLoading(false);
        return;
      }
      
      // Get age signals
      const ageData = await MyTestModule.getAgeSignals();
      setResult(JSON.stringify(ageData, null, 2));
    } catch (error: any) {
      setResult(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Test Android Age Signals API</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Hello" onPress={testHello} />
        <Button title="Get Device Info" onPress={testDeviceInfo} />
        <Button 
          title="Get Age Signals" 
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