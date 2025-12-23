#!/bin/bash
# Quick Demo Script for Hackathon Presentation
# Run this to generate all presentation materials

echo "=========================================="
echo "🚀 Smart River Watch - Hackathon Demo"
echo "=========================================="
echo ""

cd "$(dirname "$0")/ML" || exit 1

echo "📂 Running enhanced demo..."
python3 demo_sabarmati_enhanced.py

echo ""
echo "=========================================="
echo "✅ Demo completed!"
echo "=========================================="
echo ""
echo "📁 Output files:"
echo "   • Visualization: hackathon_demo/sabarmati_flood_prediction_enhanced.png"
echo "   • Summary: hackathon_demo/presentation_summary.txt"
echo ""
echo "💡 Ready for presentation!"

