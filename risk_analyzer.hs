-- Advanced Functional Risk Weighting Engine in Haskell
module Main where

import Data.Char (toLower)
import Data.List (isInfixOf)

-- Convert clause to lowercase for normalization
normalize :: String -> String
normalize = map toLower

-- Calculate risk index based on key terms
calculateRisk :: String -> Double
calculateRisk clause = 
  let normalized = normalize clause
      r1 = if "undisclosed" `isInfixOf` normalized then 0.30 else 0.0
      r2 = if "liability" `isInfixOf` normalized then 0.20 else 0.0
      r3 = if "tax" `isInfixOf` normalized then 0.15 else 0.0
      r4 = if "indemnify" `isInfixOf` normalized then 0.25 else 0.0
      r5 = if "unlimited" `isInfixOf` normalized then 0.40 else 0.0
  in min 1.0 (0.10 + r1 + r2 + r3 + r4 + r5)

main :: IO ()
main = do
  let testClause = "The acquiring company shall absorb all undisclosed historical tax liabilities up to $50M."
  let riskScore = calculateRisk testClause
  putStrLn "--- AMDS Haskell Functional Risk Engine ---"
  putStrLn $ "Input Clause: " ++ testClause
  putStrLn $ "Calculated Risk Score: " ++ show riskScore
