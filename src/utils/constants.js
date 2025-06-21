/**
 * Constants for the Skills Tree visualization
 */

// SVG margins
export const SVG_MARGIN = { 
  top: 50, 
  right: 50, 
  bottom: 50, 
  left: 50 
};

// Tree layout settings
export const TREE_LAYOUT = {
  nodeSize: [67, 120], // [height, width]
  separation: (a, b) => (a.parent === b.parent ? 1 : 1.1)
};

// Special skill mappings for better matching
export const SPECIAL_SKILL_MAPPINGS = {
  'python': ['Python'],
  'django': ['Django'],
  'django_rest_framework': ['Django REST Framework'],
  'reactjs': ['ReactJS'],
  'angularjs': ['AngularJS'],
  'mysql': ['MySQL'],
  'mongodb': ['MongoDB'],
  'redshift': ['Redshift'],
  'aws': ['AWS'],
  'jenkins': ['Jenkins'],
  'airflow': ['Airflow'],
  'apache_kafka': ['Apache Kafka'],
  'apache_spark': ['Apache Spark'],
  'pytest': ['Pytest'],
  'localstack': ['Localstack'],
  'machine_learning': ['Machine Learning'],
  'computer_vision': ['Computer Vision'],
  'nlp': ['NLP'],
  'api': ['API'],
  'teaching': ['Teaching']
};

// Colors for different states
export const COLORS = {
  highlighted: {
    node: '#3b82f6',
    stroke: '#60a5fa',
    text: 'cornflowerblue'
  },
  normal: {
    node: '#6b7280',
    stroke: '#9ca3af',
    text: 'white'
  },
  timeline: {
    background: 'rgba(255, 255, 0, 0.2)',
    stroke: 'yellow',
    text: 'yellow'
  },
  connection: {
    highlighted: '#3b82f6',
    normal: '#4b5563'
  }
};

// Timeline entry colors
export const TIMELINE_COLORS = {
  duration: 'text-yellow-300',
  company: 'text-blue-300',
  level: 'text-green-300',
  description: 'text-gray-400'
}; 