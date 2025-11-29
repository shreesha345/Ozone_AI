"""
Misinformation Detection Agent
Comprehensive analysis with Neo4j graph storage.
"""
from Agents.misinfoAgent import MisinformationDetector
from Agents.search_utils import print_search_summary, search_logger
from config import Config
import json


def main():
    """Main function to run the Misinformation Detection Agent"""
    
    print("\n" + "=" * 60)
    print("MISINFORMATION DETECTION AGENT v3.1.0")
    print("=" * 60)
    print("\nThis agent performs comprehensive misinformation analysis:")
    print("  • Statement extraction & fact-checking")
    print("  • Source reputation analysis")
    print("  • Political bias detection")
    print("  • Media/deepfake analysis")
    print("  • Neo4j graph storage")
    print("\n" + "=" * 60)
    print("\nPaste your text and press Enter twice to analyze.")
    print("Type 'exit' to quit.\n")
    
    detector = MisinformationDetector(store_in_neo4j=True)
    
    try:
        while True:
            print("\n" + "-" * 40)
            print("Enter text/URL to analyze:")
            print("-" * 40)
            
            lines = []
            while True:
                try:
                    line = input()
                except EOFError:
                    break
                
                if line.lower().strip() == 'exit':
                    print("\nGoodbye!")
                    return
                
                if line == "" and lines:
                    break
                lines.append(line)
            
            text = "\n".join(lines)
            if not text.strip():
                continue
            
            # Clear previous search logs
            search_logger.clear()
            
            try:
                result = detector.analyze(text)
                
                # Print search summary
                print_search_summary()
                
                # Ask if user wants full JSON output
                save_json = input("\nSave full JSON report? (y/n): ").lower().strip()
                if save_json == 'y':
                    filename = f"{result['meta']['scan_id']}.json"
                    with open(filename, 'w') as f:
                        json.dump(result, f, indent=2)
                    print(f"  → Saved to {filename}")
                
                # Ask if user wants detailed breakdown
                show_details = input("Show detailed claims? (y/n): ").lower().strip()
                if show_details == 'y':
                    print("\n" + "=" * 60)
                    print("DETAILED CLAIMS ANALYSIS")
                    print("=" * 60)
                    for claim in result["content_analysis"]["claims_list"]:
                        print(f"\n[{claim.get('id', 'UNKNOWN')}]")
                        text_preview = claim.get('text', 'N/A')
                        if len(text_preview) > 80:
                            text_preview = text_preview[:80] + "..."
                        print(f"  Text: {text_preview}")
                        print(f"  Status: {claim.get('status', 'UNKNOWN')}")
                        print(f"  Confidence: {claim.get('confidence', 0):.0%}")
                        if claim.get('verification_source'):
                            vs = claim['verification_source']
                            print(f"  Source: {vs.get('name', 'N/A')}")
                        if claim.get('note'):
                            note = claim['note']
                            if len(note) > 100:
                                note = note[:100] + "..."
                            print(f"  Note: {note}")
                    print("\n" + "=" * 60)
                        
            except Exception as e:
                print(f"\nError during analysis: {str(e)}")
                import traceback
                traceback.print_exc()
    
    finally:
        detector.close()


if __name__ == "__main__":
    print("\nStarting Misinformation Detection Agent...")
    
    try:
        Config.validate()
        main()
    except ValueError as e:
        print(f"\nConfig Error: {e}")
    except KeyboardInterrupt:
        print("\n\nInterrupted. Goodbye!")
    except Exception as e:
        print(f"\nError: {str(e)}")
        import traceback
        traceback.print_exc()
