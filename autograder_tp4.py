import sys
import json
import hashlib
import argparse
import os

SALT = "LAB1_IA_2026_CatedraArganaraz_SecretSalt"

def setup_encoding():
    if sys.platform == 'win32':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
            sys.stderr.reconfigure(encoding='utf-8')
        except Exception:
            pass

def main():
    setup_encoding()
    
    parser = argparse.ArgumentParser(description="Autoevaluador TP4 - Conocimiento y Razonamiento")
    parser.add_argument("answers_file", help="Ruta al archivo respuestas_tp4.json generado por el estudiante")
    parser.add_argument("--json", action="store_true", help="Salida en formato JSON para CI")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.answers_file):
        print(f"Error: No se encontró el archivo {args.answers_file}")
        sys.exit(1)
        
    rubric_file = "rubric_tp4.json"
    if not os.path.exists(rubric_file):
        print(f"Error: No se encontró la rúbrica oficial {rubric_file}")
        sys.exit(1)
        
    with open(args.answers_file, 'r', encoding='utf-8') as f:
        try:
            student_data = json.load(f)
        except json.JSONDecodeError:
            print("Error: El archivo de respuestas no es un JSON válido.")
            sys.exit(1)
            
    with open(rubric_file, 'r', encoding='utf-8') as f:
        rubric = json.load(f)
        
    total_score = 0
    max_score = rubric['max_score']
    feedback_msgs = []
    
    student_answers = student_data.get('answers', {})
    
    for ex_id, ex_data in rubric['exercises'].items():
        if ex_id not in student_answers:
            feedback_msgs.append(f"[{ex_id}] ❌ Falta resolver el ejercicio completo.")
            continue
            
        ex_student_answers = student_answers[ex_id]
        ex_hashes = ex_data['hashes']
        
        correct_count = 0
        total_items = len(ex_hashes)
        
        for item_id, correct_hash in ex_hashes.items():
            if item_id in ex_student_answers:
                val = ex_student_answers[item_id]
                text = f"{ex_id}:{item_id}:{val}:{SALT}"
                h = hashlib.sha256(text.encode('utf-8')).hexdigest()
                if h == correct_hash:
                    correct_count += 1
                else:
                    feedback_msgs.append(f"[{ex_id} -> {item_id}] ❌ Respuesta incorrecta.")
            else:
                feedback_msgs.append(f"[{ex_id} -> {item_id}] ❌ Falta responder este ítem.")
                
        if correct_count == total_items:
            total_score += ex_data['weight']
        else:
            feedback_msgs.append(f"[{ex_id}] 📖 Repaso sugerido: {ex_data['feedback']}")
            
    if args.json:
        out = {
            "score": total_score,
            "max_score": max_score,
            "feedback": feedback_msgs
        }
        print(json.dumps(out, indent=2, ensure_ascii=False))
    else:
        print("\n" + "="*50)
        print("  RESULTADOS DE AUTOEVALUACIÓN TP4")
        print("="*50)
        
        score_percent = (total_score / max_score) * 100
        bar_len = int(score_percent / 10)
        bar = "■" * bar_len + "·" * (10 - bar_len)
        
        print(f"\nNota Final: {total_score} / {max_score} pts  [{bar}]")
        print("\n" + "-"*50)
        
        if total_score == max_score:
            print("¡Excelente! 🎉 Todas las respuestas son correctas.")
        else:
            print("Detalle de errores y sugerencias de estudio:")
            for msg in feedback_msgs:
                print("  " + msg)
                
        print("-"*50 + "\n")

if __name__ == '__main__':
    main()
