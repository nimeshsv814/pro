{{- define "svc.deployment" -}}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .name }}
  labels: { app: {{ .name }} }
spec:
  replicas: {{ .replicas }}
  selector: { matchLabels: { app: {{ .name }} } }
  template:
    metadata:
      labels: { app: {{ .name }} }
    spec:
      serviceAccountName: platform-sa
      containers:
      - name: {{ .name }}
        image: {{ .image }}:{{ .tag }}
        ports:
        - containerPort: {{ .port }}
        envFrom:
        - secretRef: { name: platform-secrets }
        env:
        - { name: MONGO_URI, value: mongodb://mongodb:27017 }
        - { name: MONGO_DB, value: devops_ai }
        - { name: INGESTION_URL, value: http://ingestion-service:8080 }
        - { name: PREDICTION_URL, value: http://prediction-service:8080 }
        - { name: AUTOMATION_URL, value: http://automation-service:8080 }
        - { name: INCIDENT_URL, value: http://incident-service:8080 }
        livenessProbe: { httpGet: { path: /health, port: {{ .port }} }, initialDelaySeconds: 10 }
        readinessProbe: { httpGet: { path: /health, port: {{ .port }} }, initialDelaySeconds: 5 }
---
apiVersion: v1
kind: Service
metadata:
  name: {{ .name }}
spec:
  selector: { app: {{ .name }} }
  ports:
  - port: {{ .port }}
    targetPort: {{ .port }}
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ .name }}
spec:
  minReplicas: 2
  maxReplicas: 10
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: {{ .name }} }
  metrics:
  - type: Resource
    resource: { name: cpu, target: { type: Utilization, averageUtilization: 65 } }
{{- end -}}
